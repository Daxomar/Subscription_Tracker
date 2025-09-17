import { Router} from 'express';
import { signUp, signIn, signOut, sendVerifyOtp, verifyEmail, isAuthenicated, sendResetOtp, resetPassword, } from '../controllers/auth.controller.js';
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


authRouter.post('/is-auth', protect, isAuthenicated)


authRouter.post('/send-reset-otp', protect ,  sendResetOtp)


authRouter.post('/reset-password', protect, resetPassword)








export default authRouter;