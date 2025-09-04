import { workflowClient } from '../config/upstash.js';
import Subscription from '../models/subscription.model.js'
import { SERVER_URL } from "../config/env.js";
import User from '../models/user.model.js'


export const createSubscription = async (req, res, next)=>{
    try{


    const subscription = await Subscription.create({
        ...req.body,
        user: req.body.userId 
        // req.user._id,

        });
       
const {workflowRunId } = await workflowClient.trigger({
     url:`${SERVER_URL}/api/v1/workflows/subscription/reminder`,
     body:{
        subscriptionId: subscription.id,
     },
     headers:{
        'content-type': 'application/json',
     },
     retries:0,
})


    // Save the workflowRunId to the subscription document
            subscription.workflowRunId = workflowRunId;
            await subscription.save();

        res.status(201).json({
            success: true,
            data: {subscription , workflowRunId},
            message: 'Subscription created successfully'
                        })


    }catch(error){
        console.log("here is the error",error)
        next(error)
    }
}






export const getUserSubscriptions = async (req, res, next)=>{
    try{

      const {userId} = req.body;
    const subscriptions = await Subscription.find({ user: userId });
        res.status(200).json({
            success:true,
             data: subscriptions
            })

    }catch(error){
        console.log(error)
        next(error)
    }
}

 




//For my frontend, when i do it
// const handleDelete = async (subscriptionId) => {
    
//     await fetch(`/api/subscriptions/${subscriptionId}`, {
//         method: 'DELETE',
//         credentials: 'include'
//     });
    
// };


export const deleteSubscription = async (req, res, next) =>{
   
    try{
        const {id:subscriptionId } = req.params; // Get ID from URL
        const {userId} = req.body; 

        const subscription = await Subscription.findOne({ 
            _id: subscriptionId, 
            user: userId 
        });
 

         if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found or unauthorized'
            });
        }
       
        console.log(subscription.workflowRunId);
       await workflowClient.cancel({ ids: subscription.workflowRunId });
        //  console.log('Old workflow cancelled successfully for deleted subscription');
        let deletedSubscription = await Subscription.findByIdAndDelete(subscriptionId);
        console.log("Deleted subscription:", deletedSubscription);

       res.status(200).json({
            success: true,
            message: 'Subscription deleted successfully and canceled workflow'
        });


    }catch(error){

        console.log(error)
        next(error)
    }


}






export const updateSubscription = async (req, res, next) => { 
    try { 
        const { id: subscriptionId } = req.params; 
        const { userId } = req.body; 
        const updateData = req.body; 
         
        // Remove userId from updateData to avoid updating it 
        delete updateData.userId; 
 
        const existingSubscription = await Subscription.findOne({  
            _id: subscriptionId,  
            user: userId  
        }); 
 
        if (!existingSubscription) { 
            return res.status(404).json({ 
                success: false, 
                message: 'Subscription not found or unauthorized' 
            }); 
        } 

        const oldWorkflowRunId = existingSubscription.workflowRunId;
        console.log("oldWorkflowRunId right here line147 subcontroller", oldWorkflowRunId);
 

        //Creating the instance I would use to solicit the update to the db
        let updatedSubscription;

     
        // **NEW LOGIC: Check if start date changed (source of truth)**
        const isStartDateBeingUpdated = updateData.startDate;
        const isStartDateActuallyChanging = updateData.startDate !== existingSubscription.startDate;
        
        // **ALSO check renewal date as backup**
        const isRenewalDateBeingUpdated = updateData.renewalDate;
        const isRenewalDateActuallyChanging = updateData.renewalDate !== existingSubscription.renewalDate;
        
        // **Combined logic: workflow needs update if EITHER start or renewal date changes**
        const needsWorkflowUpdate = (isStartDateBeingUpdated && isStartDateActuallyChanging) || 
                                   (isRenewalDateBeingUpdated && isRenewalDateActuallyChanging);
 
        console.log(needsWorkflowUpdate);
        let newWorkflowRunId = null;
 
        // **Exit early if no date changes**
        if (!needsWorkflowUpdate) {
            console.log('No start date or renewal date changes detected, skipping workflow update');
            
            return res.status(200).json({ 
                success: true, 
                data: { 
                    updatedSubscription, 
                    newWorkflowRunId: null,
                    oldWorkflowRunId,
                    workflowAction: 'none',
                    reason: 'No date changes detected'
                }, 
                message: 'Subscription updated successfully (no workflow changes)' 
            }); 
        }

        // **WORKFLOW UPDATE LOGIC - Only runs if dates actually changed**
        try { 
            console.log('Date changed, updating workflow...', {
                startDateChanged: isStartDateActuallyChanging,
                renewalDateChanged: isRenewalDateActuallyChanging,
                oldStartDate: existingSubscription.startDate,
                newStartDate: updateData.startDate,
                oldRenewalDate: existingSubscription.renewalDate,
                newRenewalDate: updateData.renewalDate
            });

            // **CANCEL OLD WORKFLOW FIRST**
            if (oldWorkflowRunId) {
                try {
                    console.log('Cancelling old workflow:', oldWorkflowRunId);
                    //Man i really suffered here, read the Docs 
                        await workflowClient.cancel({ 
                        ids: oldWorkflowRunId 
                        });
                    console.log('Old workflow cancelled successfully');
                } catch (cancelError) {
                    console.error('Failed to cancel old workflow:', cancelError);
                }
            }

            // **CREATE NEW WORKFLOW based on updated subscription**
            const {workflowRunId} = await workflowClient.trigger({
                url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
                body: {
                    subscriptionId,
                    // Pass the source of truth dates
                    startDate: updateData.startDate,
                    renewalDate: updateData.renewalDate
                },
                headers: {
                    'content-type': 'application/json',
                },
                retries: 0,
            });

            newWorkflowRunId = workflowRunId; 
            console.log("new workflowId created:", newWorkflowRunId);

            // Update the database
            if (newWorkflowRunId) { 
                 updatedSubscription = await Subscription.findByIdAndUpdate(
                            subscriptionId,
                            {
                                ...updateData,
                                workflowRunId: newWorkflowRunId,
                            },
                            {
                                new: true,
                                runValidators: true,
                            }
                  );
                console.log('New workflow created successfully:', newWorkflowRunId); 
            } 

        } catch (workflowError) { 
            console.error('Workflow update failed:', workflowError); 
        } 

        console.log("Final newWorkflowRunId:", newWorkflowRunId);
 
        res.status(200).json({ 
            success: true, 
            data: { 
                updatedSubscription, 
                newWorkflowRunId, 
                oldWorkflowRunId,
                workflowAction: 'updated',
                dateChanges: {
                    startDateChanged: isStartDateActuallyChanging,
                    renewalDateChanged: isRenewalDateActuallyChanging
                }
            }, 
            message: 'Subscription and workflow updated successfully' 
        }); 
 
    } catch (error) { 
        console.log(error); 
        next(error); 
    } 
};

