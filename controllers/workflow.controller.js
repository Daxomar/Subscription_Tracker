import dayjs from 'dayjs';
import {createRequire} from 'module';
const require = createRequire(import.meta.url);
const {serve} = require('@upstash/workflow/express');// since i changed to es6 modules, i need to find an alternative to require the top code helped
import Subscription from '../models/subscription.model.js';

const REMINDERS = [7, 5, 2, 1]


export const sendReminders = serve(async (context)=>{
    const {subscriptionId} = context.requestPayload;
    console.log('Sending reminder for subscription ID:', subscriptionId);

    const subscription = await fetchSubscription(context, subscriptionId); // me debugging here
    console.log(subscription)
    
    if(!subscription || subscription.status !== "active") return
    

   const renewalDate = dayjs(subscription.renewalDate);

   if(renewalDate.isBefore(dayjs())){
    console.log(`Renewal date for subscription ID: ${subscriptionId} has already passed. Stopping workflow`);
    return;
   }


   for(const daysBefore of REMINDERS){
    const reminderDate = renewalDate.subtract(daysBefore, 'day');
    // renewal date = 22 FEB, reminder date will be 15 FEB if daysBefore = 7, and 17 FEB if daysBefore = 5, and so on

    if(reminderDate.isAfter(dayjs())){
           await sleepUntilReminder( context, `Reminder${daysBefore} days before`, reminderDate)
        }
     

    await triggerReminder(context, `Reminder ${daysBefore} days before`)


  }

})



const sleepUntilReminder = async(context, label, date)=>{
    console.log(`Sleeping until ${label} reminder at ${date}`);
    await context.sleepUntil(label, date.toDate());
}


const triggerReminder = async (context, label)=>{
   return await context.run(label, ()=>{
    console.log(`Triggering ${label} reminder`)
    //Send email, SMS, push notification....
    //About to write this logic ///
   })
}


const fetchSubscription = async (context, subscriptionId)=> {
    return await context.run('get susbscription',async ()=>{ 
        console.log(Subscription.findById(subscriptionId).populate('user', 'name email'))  //populate() replaces the referenced ObjectId in a document with the actual data from the linked collection.
        return Subscription.findById(subscriptionId).populate('user', 'name email');
        
        
    })
}