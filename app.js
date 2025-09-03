
import express from 'express';
import cookieParser from 'cookie-parser';
import { PORT } from './config/env.js';

import userRouter from './routes/user.routes.js'
import authRouter from './routes/auth.routes.js';  
import subscriptionRouter from './routes/subscription.routes.js';
import connectToDatabase from './database/mongodb.js';
import errorMiddleware from './middlewares/error.middleware.js';
import arcjetMiddleware from './middlewares/arcjet.middleware.js';
import workflowRouter from './routes/workflow.routes.js'; 



const app = express();

app.use(express.json()); //allows express to parse JSON bodies
app.use(express.urlencoded({ extended: false })); //allows express to parse URL-encoded bodies
app.use(cookieParser()); //allows express to parse cookies

app.use(arcjetMiddleware)



app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/workflows', workflowRouter);

app.use(errorMiddleware)


app.get('/', (req , res)=> {
    res.send( "Welcome to the Subscription Tracker API");
});

app.get('/api', (req, res) => {
    res.json({ message: 'API is working!' });
});

console.log('Server is running on port 5000');

app.listen(PORT, async () => {
    console.log(`Subscription tracker is running on http://localhost:${PORT}`);
   await connectToDatabase()
});



export default app;