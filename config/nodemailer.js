import nodemailer from 'nodemailer';
import { EMAIL_PASSWORD } from './env.js';


export const accountEmail = "daxohnero@gmail.com";

// This one is for my EmailRemiders of subscriptions
export const SendRemindertransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: accountEmail,
    pass: EMAIL_PASSWORD,
  },
}); 



// This one is for Welcome Emails
export const Welcometransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
       user: accountEmail,
       pass: EMAIL_PASSWORD,
    },
 });  



//This one is for OTP Emails
export const OTPtransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: accountEmail,
      pass: EMAIL_PASSWORD,
    },
  });





