import { workflowClient } from '../config/upstash.js';
import Subscription from '../models/subscription.model.js'
import { SERVER_URL } from "../config/env.js";

export const createSubscription = async (req, res, next)=>{
    try{
    const subscription = await Subscription.create({
        ...req.body,
        user: req.user._id,

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
        next(error)
    }
}




export const getUserSubscriptions = async (req, res, next)=>{
    try{

        //Check if the user is the same as the one in the token(making the request)
        if(req.user.id !== req.params.id){
            const error = new Error('You are not the owner of this account');
            error.status = 401
            throw error;        
        }

        const subscriptions = await Subscription.find({user: req.params.id});
        res.status(200).json({
            success:true,
             data: subscriptions
            })

    }catch(error){
        next(error)
    }
}






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