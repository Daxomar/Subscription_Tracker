
import express from 'express';
import cookieParser from 'cookie-parser';
import { PORT } from './config/env.js';
import cors from 'cors'
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

const allowedOrigins = ['https://4e6d2252dacf.ngrok-free.app', 'https://89a22ec05e1f.ngrok-free.app', 'http://localhost:5000','http://localhost:3000' ]

// app.use(cors({
//     origin:allowedOrigins,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials:true,
     
// }))



app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));






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