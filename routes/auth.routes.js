import { Router} from 'express';
import { signUp, signIn, signOut, sendVerifyOtp, verifyEmail, isAuthenicated, sendResetOtp, resetPassword, verifyresetOtp,  refresh } from '../controllers/auth.controller.js';
import arcjetMiddleware from '../middlewares/arcjet.middleware.js';
import {userAuthCookie, protect} from '../middlewares/auth.middleware.js';

const authRouter = Router();

//path: /api/v1/auth/sign-up (POST)
authRouter.post('/sign-up', signUp)

//path: /api/v1/auth/sign-in (POST)
authRouter.post('/sign-in',  signIn)


//path: /api/v1/auth/sign-out (POST)
authRouter.post('/sign-out', signOut)


authRouter.post('/send-verify-otp', protect, sendVerifyOtp)
// authRouter.post('/send-verify-otp', protect, sendVerifyOtp)


authRouter.post('/verify-account', protect, verifyEmail)


authRouter.get('/is-auth', protect, isAuthenicated)  //This is my silent pinger running on useEffect with everyrefresh


authRouter.post('/send-reset-otp', sendResetOtp)


authRouter.post('/verify-reset-otp', verifyresetOtp) // This is different from verify email, cause the user is not logged in, hence we can't
//use their token_id like we did in the verifyEmail, user must manually input email they used to create their account lol


authRouter.post('/reset-password', resetPassword)


authRouter.post('/refresh', refresh)  // I finally added the refresh route. access and refresh token implemented








export default authRouter;