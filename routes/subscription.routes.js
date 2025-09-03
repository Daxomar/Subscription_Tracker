import { Router } from "express";
import {authorize, userAuthCookie} from "../middlewares/auth.middleware.js";
import { createSubscription, getUserSubscriptions, deleteSubscription, updateSubscription } from "../controllers/subscription.controller.js";

const subscriptionRouter = Router();

subscriptionRouter.get('/', (req, res)=> res.send({title: 'GET all subscriptions endpoint is working!'}));

 subscriptionRouter.get('/my-subscriptions', userAuthCookie, getUserSubscriptions);

subscriptionRouter.get('/:id', (req, res)=> res.send({title: 'GET subscription details by ID endpoint is working!'}));


subscriptionRouter.post('/', userAuthCookie, createSubscription);   //I added the right authorization middleware over here to pass req.user._id 
//so that I can use it in the createSubscription controller function to set the user field of the subscription to req.user._id

subscriptionRouter.patch('/:id', userAuthCookie, updateSubscription);


subscriptionRouter.delete('/:id', userAuthCookie, deleteSubscription);


// subscriptionRouter.get('/user/:id', userAuthCookie,  getUserSubscriptions);





subscriptionRouter.put('/:id/cancel', (req, res)=> res.send({title: 'CANCEL subscription endpoint is working!'}));


subscriptionRouter.get('/upcoming-renewals', (req, res)=> res.send({title: 'GET upcoming renewals endpoint is working!'}));







export default subscriptionRouter;








// {
//    "name": "CRUN",
//    "price": 139,
//    "currency": "USD",
//    "frequency": "monthly",
//    "category": "entertainment",
//    "startDate": "2025-08-4",
//    "paymentMethod": "Credit Card"
// }