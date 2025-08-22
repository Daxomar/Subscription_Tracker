import  { Router} from 'express';

import authorize from '../middlewares/auth.middleware.js'
import {getUsers, getUser} from '../controllers/user.controller.js'
const userRouter = Router();

//GET /users - Get all users
//GET /users/:id - Get a user by ID
//POST /users - Create a new user
//PUT /users/:id - Update a user by ID
//DELETE /users/:id - Delete a user by ID



userRouter.get('/', getUsers);    // I have to later add the admin authorization middleWare over here too later for strict acces


userRouter.get('/:id', authorize, getUser);  //I added the right authorization middleware over here


userRouter.post('/', (req, res)=> res.send({title: 'Create new user endpoint is working!'}));


userRouter.put('/:id', (req, res)=> res.send({title: 'Update user by ID endpoint is working!'}));


userRouter.delete('/:id', (req, res)=> res.send({title: 'Delete user by ID endpoint is working!'}));


export default userRouter;
