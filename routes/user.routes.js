import  { Router} from 'express';

const userRouter = Router();

//GET /users - Get all users
//GET /users/:id - Get a user by ID
//POST /users - Create a new user
//PUT /users/:id - Update a user by ID
//DELETE /users/:id - Delete a user by ID



userRouter.get('/', (req, res)=> res.send({title: 'Get all users endpoint is working!'}));


userRouter.get('/:id', (req, res)=> res.send({title: 'Get user by ID endpoint is working!'}));


userRouter.post('/', (req, res)=> res.send({title: 'Create new user endpoint is working!'}));


userRouter.put('/:id', (req, res)=> res.send({title: 'Update user by ID endpoint is working!'}));


userRouter.delete('/:id', (req, res)=> res.send({title: 'Delete user by ID endpoint is working!'}));


export default userRouter;
