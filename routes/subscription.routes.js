import { Router } from "express";
import {authorize, userAuthCookie,protect, authorizeRoles} from "../middlewares/auth.middleware.js";
import { createSubscription, getUserSubscriptions, deleteSubscription, updateSubscription, getAllSubscriptions } from "../controllers/subscription.controller.js";

const subscriptionRouter = Router();


//ADMIN ENDPOINT
// subscriptionRouter.get('/', (req, res)=> res.send({title: 'GET all subscriptions endpoint is working!'}));
subscriptionRouter.get('/', protect, authorizeRoles("admin") , getAllSubscriptions)



//USER ENDPOINT
// subscriptionRouter.get('/my-subscriptions', userAuthCookie, getUserSubscriptions);
subscriptionRouter.get('/my-subscriptions', protect, getUserSubscriptions);


//USER AND ADMIN ENDPOINT
// subscriptionRouter.post('/', userAuthCookie, createSubscription);   //I added the right authorization middleware over here to pass req.user._id 
//so that I can use it in the createSubscription controller function to set the user field of the subscription to req.user._id
subscriptionRouter.post('/', protect, createSubscription);

//USER AND ADMIN ENDPOINT
// subscriptionRouter.patch('/:id', userAuthCookie, updateSubscription);
subscriptionRouter.patch('/:id', protect, updateSubscription)

//USER AND ADMIN ENDPOINT
// subscriptionRouter.delete('/:id', userAuthCookie, deleteSubscription);
subscriptionRouter.delete('/:id', protect, deleteSubscription);


//USER ENDPOINTS
subscriptionRouter.get('/upcoming-renewals', (req, res)=> res.send({title: 'GET upcoming renewals endpoint is working!'}));



// FUTURE IMPLEMENTATION WHEN I ACTUALLY DO INEGRATE WITH REAL WORL PAYMENT SYSTEMS
subscriptionRouter.put('/:id/cancel', (req, res)=> res.send({title: 'CANCEL subscription endpoint is working!'}));

//USER AND ADMIN ENDPOINT
subscriptionRouter.get('/:id', (req, res)=> res.send({title: 'GET subscription details by ID endpoint is working!'}));



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