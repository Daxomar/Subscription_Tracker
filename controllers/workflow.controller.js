// import dayjs from 'dayjs';
// import {createRequire} from 'module';
// const require = createRequire(import.meta.url);
// const {serve} = require('@upstash/workflow/express');// since i changed to es6 modules, i need to find an alternative to require the top code helped
// import Subscription from '../models/subscription.model.js';
// import  sendReminderEmail from '../utils/send-email.js';



// const REMINDERS = [7, 5, 2, 1]


// export const sendReminders = serve(async (context)=>{
//     const {subscriptionId} = context.requestPayload;
//     console.log('Sending reminder for subscription ID:', subscriptionId);

//     const subscription = await fetchSubscription(context, subscriptionId); // me debugging here
//     console.log(subscription)
    
//     if(!subscription || subscription.status !== "active") return
    

//    const renewalDate = dayjs(subscription.renewalDate);

//    if(renewalDate.isBefore(dayjs())){
//     console.log(`Renewal date for subscription ID: ${subscriptionId} has already passed. Stopping workflow`);
//     return;
//    }


//    for(const daysBefore of REMINDERS){
//     const reminderDate = renewalDate.subtract(daysBefore, 'day');
//     // renewal date = 22 FEB, reminder date will be 15 FEB if daysBefore = 7, and 17 FEB if daysBefore = 5, and so on
    

//     if(reminderDate.isAfter(dayjs())){
//            await sleepUntilReminder( context, `Reminder${daysBefore} days before`, reminderDate)
//         }

//       if (dayjs().isSame(reminderDate, 'day')) {
//       await triggerReminder(context, `${daysBefore} days before reminder`, subscription);
//     }   
     

//                                     // 2 days before reminder
//     await triggerReminder(context,` ${daysBefore} days before reminder`, subscription)


//   }

// })



// const sleepUntilReminder = async(context, label, date)=>{
//     console.log(`Sleeping until ${label} reminder at ${date}`);
//     await context.sleepUntil(label, date.toDate());
// }


// const triggerReminder = async (context, label, subscription)=>{
//    return await context.run(label, async ()=>{
//     console.log(`Triggering ${label} reminder`)
//     //Send email, SMS, push notification....
//     //About to write this logic ///

//      await sendReminderEmail({
//       to: subscription.user.email,
//       type: label,
//       subscription,
//     })
// })
// }


// const fetchSubscription = async (context, subscriptionId)=> {
//     return await context.run('get susbscription',async ()=>{ 
//         console.log(Subscription.findById(subscriptionId).populate('user', 'name email'))  //populate() replaces the referenced ObjectId in a document with the actual data from the linked collection.
//         return Subscription.findById(subscriptionId).populate('user', 'name email');
        
        
//     })
// }






import dayjs from 'dayjs'
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");
import Subscription from '../models/subscription.model.js';
import sendReminderEmail from '../utils/send-email.js';

const REMINDERS = [7, 5, 2, 1]

export const sendReminders = serve(async (context) => {
  const { subscriptionId } = context.requestPayload;
  const subscription = await fetchSubscription(context, subscriptionId);

  console.log('Sending reminder lololololollo ahahahahahaah for subscription ID:', subscriptionId);
   console.log(subscription)

  if(!subscription || subscription.status !== 'active') return;

  const renewalDate = dayjs(subscription.renewalDate);

  if(renewalDate.isBefore(dayjs())) {
    console.log(`Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`);
    return;
  }

  for (const daysBefore of REMINDERS) {
    const reminderDate = renewalDate.subtract(daysBefore, 'day');

    if(reminderDate.isAfter(dayjs())) {
      await sleepUntilReminder(context, `Reminder ${daysBefore} days before`, reminderDate);
    }

    if (dayjs().isSame(reminderDate, 'day')) {
      await triggerReminder(context, `${daysBefore} days before reminder`, subscription);
    }
  }
});

const fetchSubscription = async (context, subscriptionId) => {
  return await context.run('get subscription', async () => {
    return Subscription.findById(subscriptionId).populate('user', 'name email');
  })
}

const sleepUntilReminder = async (context, label, date) => {
  console.log(`Sleeping until ${label} reminder at ${date}`);
  await context.sleepUntil(label, date.toDate());
}

const triggerReminder = async (context, label, subscription) => {
  return await context.run(label, async () => {
    console.log(`Triggering ${label} reminder`);

    await sendReminderEmail({
      to: subscription.user.email,
      type: label,
      subscription,
    })
  })
}







