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

       await Subscription.findByIdAndDelete(subscriptionId);

       res.status(200).json({
            success: true,
            message: 'Subscription deleted successfully'
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

        const updatedSubscription = await Subscription.findByIdAndUpdate(
            subscriptionId, 
            updateData, 
            { 
                new: true,
                runValidators: true
            }
        ); // This function automatically updates the db


        const isRenewalDateBeingUpdated = updateData.renewalDate;
        const isRenewalDateActuallyChanging = updateData.renewalDate !== existingSubscription.renewalDate;

        let workflowRunId; 

        if (isRenewalDateBeingUpdated && isRenewalDateActuallyChanging) {
            try {
                console.log('Renewal date changed, updating workflow...');

                const response = await workflowClient.trigger({
                    url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
                    body: {
                        subscriptionId: updatedSubscription.id,
                    },
                    headers: {
                        'content-type': 'application/json',
                    },
                    retries: 0,
                });

                workflowRunId = response.workflowRunId;

                if (workflowRunId) {
                    await Subscription.findByIdAndUpdate(subscriptionId, {
                        workflowRunId: workflowRunId
                    });
                    console.log('Workflow updated successfully:', workflowRunId);
                }

            } catch (workflowError) {
                console.error('Workflow update failed:', workflowError);
            }
        }

        res.status(200).json({
            success: true,
            data: { updatedSubscription, workflowRunId }, // now always defined (may be undefined/null)
            message: 'Subscription updated successfully'
        });


    } catch (error) {
        console.log(error);
        next(error);
    }
};

// {
//  "name": "Netflix Premium",
//  "price": 15.99,
//   "currency": "USD",
//   "frequency": "monthly",
//   "category":"entertainment",
//   "startDate": "2024-02-01",
//   "paymentMethod": "Credit Card"
  
//   }

// 68aa84b67a0e1e568d6fbf7b