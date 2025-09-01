

import User from '../models/user.model.js';
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from "../config/env.js";

export const userAuthCookie = async (req, res, next) => {
      
    const {token} = req.cookies;

    if(!token) return res.status(401).json({message: 'Unauthorized, login again'});

     
    try{
    const tokenDecoded = jwt.verify(token, JWT_SECRET);
    console.log(tokenDecoded)// for testing purposes

    if(tokenDecoded.id){
      req.body.userId = tokenDecoded.id;
    }else{
        return res.status(401).json({message: 'Unauthorized, login again'});
      }

    next(); 

}catch(error){

    return res.status(401).json({message: 'Unauthorized, login again', error: error.message})

}

}















/// I used this when i manually added the bearer token in postman to test protected routes
export const authorize = async (req, res, next) =>{
    try{

        let token; 
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            token = req.headers.authorization.split(' ')[1];
        }

        if(!token) return res.status(401).json({message: 'Unauthorized'});

        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded.userId);

        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        req.user = user;
        
        next();

    }catch(error){

        res.status(401).json({message: 'Unauthorized', error: error.message})
    }
}


export default authorize