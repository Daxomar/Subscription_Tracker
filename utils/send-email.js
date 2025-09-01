import { emailTemplates, generateWelcomeEmailTemplate, generateOTPEmailTemplate } from "./email-template.js";
import { accountEmail,  SendRemindertransporter, Welcometransporter, OTPtransporter } from "../config/nodemailer.js";
import dayjs from 'dayjs';


export const sendReminderEmail = async ({to, type, subscription})=>{
   if(!to || !type ) throw new Error ('Missing required parameters');

   const template = emailTemplates.find((t)=> t.label === type);

   if(!template) throw new Error('Invalid email type');

   const mailInfo = {
    userName: subscription.user.name,
    subscriptionName: subscription.name,
    renewalDate: dayjs(subscription.renewalDate).format('MMMM D, YYYY'),
    planName: subscription.name,
    price: `${subscription.currency} ${subscription.price}  ${subscription.frequency}`,
    paymentMethod: subscription.paymentMethod 
   }


   const message = template.generateBody(mailInfo);
   const subject = template.generateSubject(mailInfo)
   
   const mailOptions ={
    from: accountEmail,
    to:to,
    subject:subject,
    html: message,
   }

   SendRemindertransporter.sendMail(mailOptions, (error, info)=>{
    if(error) return  console.error('Error sending email:', error);
    
    console.log('Email sent:' + info.response);
    
   })

}



export const sendWelcomeEmail = async ({ to, userName }) => {
  if (!to) throw new Error('Email address is required');
  
  const mailOptions = {
    from: accountEmail,
    to: to,
     subject: 'Welcome to Dave SubDub! 🎉',
     html: generateWelcomeEmailTemplate({ 
      userName,
      accountSettingsLink: 'https://yourapp.com/dashboard',
      supportLink: 'https://yourapp.com/support'
    })
  };


  try {
    const info = await Welcometransporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
    return info;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};



export const sendOTPEmail = async ({ to, userName, otpCode, expiryMinutes }) => {
  if (!to || !otpCode) throw new Error('Email and OTP code are required');
  
  const mailOptions = {
    from: accountEmail,
    to: to,
    subject: 'Your Reset Verification Code - Dave SubDub',
    html: generateOTPEmailTemplate({ 
      userName,
      otpCode,
      expiryMinutes,
      supportLink: 'https://yourapp.com/support'
    })
  };

  try {
    const info = await OTPtransporter.sendMail(mailOptions);
    console.log('OTP email sent successfully');
    return info;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};
