import mongoose from "mongoose";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import User from "../models/user.model.js";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";
import { sendWelcomeEmail, sendOTPEmail } from "../utils/send-email.js";

// import { NODE_ENV, } from "../config/env.js";   //might have to uncomment this later as well as dotenv not sure


export const signUp = async (req, res, next) => {
     const session = await mongoose.startSession();
     session.startTransaction(); // I actually learnt this in class for relational dbs, makes the database atomic
     //all or nothing, no halfway authentications, it either works or it doesn't



    // So that we don't have to send empty details to the server
     const {name, email, password} = req.body;
    if(!name|| !email || !password){
        return res.json(
            {
                success: false,
                message: 'Missing Details, Please provide them'
            }
        )
    }



      try{      
        //Check if user already exists
        const existingUser = await User.findOne({email});

        if(existingUser){
            const error = new Error('User already exists')
            error.statusCode = 409;
            throw error;
        }
    
        //If newuser doesn't already exit continue flow and hash created passwords
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUsers = await User.create([{name, email, password: hashedPassword }], {session}); // I might change this later for just singleNewUser creation
        const token = jwt.sign({id: newUsers[0]._id }, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN});
        // const token = jwt.sign({userId: newUsers[0]._id }, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN});
        await session.commitTransaction();
        session.endSession();



              //res.cookies // don't forget to set cookies here later
          res.cookie('token', token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', //only send cookie over https
            sameSite: process.env.NODE_ENV ==='production'? 'none': 'strict',
            maxAge: 1000 * 60 * 60 * 24 * 7, //1 week 
          })

     
       res.status(201).json({
        success: true,
        message: 'User created successfully',
        data:{
            token,
            user:newUsers[0],
        }
       });


       // Sends the welcome email 
        await sendWelcomeEmail({ 
            to: email, 
            userName: name 
            })



      } catch(error){
            await session.abortTransaction();
            session.endSession();
            next(error);
        }
    
}



export const signIn = async (req, res, next)=>{

    // So that we don't have to send empty details to the server
    const {email, password} = req.body;
    if(!email || !password){
        return res.json(
            {
                success: false,
                message: 'Missing Details, Please provide them'
            }
        )
    }


   try{

   const user = await User.findOne({email});

   if(!user){
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
   };

   const isPasswordValid = await bcrypt.compare(password, user.password)
     if(!isPasswordValid){
        const error = new Error('Invalid password')
        error.statusCode = 401;
        throw error;
     };

     const token = jwt.sign({id: user._id }, JWT_SECRET, {expiresIn : JWT_EXPIRES_IN});
    //  const token = jwt.sign({userId: user._id }, JWT_SECRET, {expiresIn : JWT_EXPIRES_IN});

      
     // pushing the token in a cookie
          res.cookie('token', token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', //only send cookie over https
            sameSite: process.env.NODE_ENV ==='production'? 'none': 'lax',    // more look into this later!!!!!!
            maxAge: 1000 * 60 * 60 * 24 * 7, //1 week 
          })


          // I will remove this later, currently just for testing purposes
     res.status(200).json(
        {
            success: true, 
            message: 'User signed in successfully',
            data:{
                token,
                user, // expecting the user with that particular email
            }
        }
     )


   }catch(error){
    console.log(error)
    next(error)
   }
}




export const signOut = async (req, res , next)=>{

    // try{
    //     res.clearCookie('token',{
    //         httpOnly : true,
    //         secure: process.env.NODE_ENV === 'production',
    //         sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    //     });

    //      return res.json({success: true, message: "Sign out successful"});

    // } catch(error){
    //     console.log(error)
    //     next(error)
    // }

}



// Send Verification OTP to the User's Email (Optional)   // will uncomment it when i add the need columns to the user model
export const sendVerifyOtp = async (req, res, next) => {
    
      try{
        //since there is no option to send userId in the body from the frontend, I will just use the user from the authorize middleware
        
        const {userId} = req.body;
        console.log("otpdebug", userId)
        const user = await User.findById(userId);

        if(user.isAccountVerified){
            return res.json({success: false, message: 'Account already verified'})
       }


       const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
       user.verifyOtp = otp;
       user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes 
       await user.save();


    // Sends the OTP email  
            await sendOTPEmail({ 
                to: user.email, 
                userName: user.name,
                otpCode: otp,
                expiryMinutes: 10,
        });

        res.json({success: true, message: 'Verification OTP email sent successfully'})

 
      }catch(error){
        res.json({success: false, message: 'Could not send verification OTP email', error: error.message})
        next(error)
      }
    // Implementation for sending verification email
}






// Verify the OTP entered by the user Optional  // will uncomment it when i add the need columns to the user model
export const verifyEmail = async (req, res, next) =>{

     //since there is no option to send userId in the body from the frontend, I will just use the user from the authorize middleware
    const {userId, otp} = req.body;

    if(!userId || !otp){
        return res.json({success: false, message: 'Missing details, please provide them'})
    }
    try{

       const user = await User.findById(userId);

      // If user with the provided id doesn't exist
      if(!user){
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      //Checks OTP entered and OTP in the users database are the same
      if(user.verifyOtp ==='' || user.verifyOtp !== otp){
        return res.json({success: false, message: 'Invalid OTP'})
      }

      //Checks if OTP has expired
      if(user.verifyOtpExpireAt < Date.now()){
        return res.json({success: false, message: 'OTP has expired, please request a new one'})
      }

      // If everything is fine, verify the users account
        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0; 

        await user.save();
        res.json({success: true, message: 'Email Account verified successfully'})


    }catch(error){
        res.json({success: false, message: 'Could not Verify Account', error: error.message})
        next(error)

    }

}



//Check if user is authenticated
export const isAuthenicated = async (req, res)=>{
    try{
        return res.json({success: true});

    }catch(error){
        res.json({ succes:false, message: error.message

        })
    }
}




//Send Password Reset OPT
export const sendResetOtp = async(req, res)=>{
    const {email} = req.body;

    if(!email){
        return res.json({success: false, message: "Email is required"})
    }

    try{
       const user = await User.findOne({email});

      if(!user){
        return res.json({
            success: false, message: "User not found"
        })
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
       user.resetOtp = otp;
       user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes 
       await user.save();


    // Sends the OTP email  
            await sendOTPEmail({ 
                to: user.email, 
                userName: user.name,
                otpCode: otp,
                expiryMinutes: 10,
        });
     
    res.json({success: true, message: "Reset OTP sent to email"})

   }catch(error){
        res.json({success: false, message: 'Could not send reset OTP email', error: error.message})
        next(error)
      }
}



// Reset User Password
export const resetPassword = async (req, res, next)=>{
    const {email, otp, newPassword} = req.body;

    if(!email || !otp || !newPassword){
        return res.json({
            success: false, 
            message:"Email, OTP and new Password are required"
        })
    }; 



    try{
     const user = await User.findOne({email});
     if(!user){
        return res.json({
            success:false, 
            message: "User not Found"
        })
     }; 


     console.log("Reset Password should be working if this consoles", user.name + newPassword + otp)


      if(user.resetOtp === "" || user.resetOtp !== otp){
        return res.json({
            success: false, 
            message:"Invalid OTP"
        })
      };


     if(user.resetOtpExpireAt < Date.now()){
        return res.json({
            success: false, message: "reset OTP expired"
        })
     };

        //hash the new password and push to database
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPasswor, salt);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;


        await user.save();

        return res.json({
            success: true, message: 'Password has been reset successfully'
        });

    }catch(error){
       res.json({success: false, message: 'Could not send reset password', error: error.message})
        next(error)   
    }
}



