import { Router } from "express";

const subscriptionRouter = Router();

subscriptionRouter.get('/', (req, res)=> res.send({title: 'GET all subscriptions endpoint is working!'}));



subscriptionRouter.get('/:id', (req, res)=> res.send({title: 'GET subscription detail endpoint is working!'}));


subscriptionRouter.post('/', (req, res)=> res.send({title: 'CREATE new subscription endpoint is working!'}));



subscriptionRouter.put('/', (req, res)=> res.send({title: 'UPDATE subscriptions endpoint is working!'}));


subscriptionRouter.delete('/', (req, res)=> res.send({title: 'DELETE subscriptions endpoint is working!'}));


subscriptionRouter.get('/user/:id', (req, res)=> res.send({title: 'GET specific user subscriptions endpoint is working!'}));


subscriptionRouter.put('/:id/cancel', (req, res)=> res.send({title: 'CANCEL subscription endpoint is working!'}));


subscriptionRouter.get('/upcoming-renewals', (req, res)=> res.send({title: 'GET upcoming renewals endpoint is working!'}));







export default subscriptionRouter;