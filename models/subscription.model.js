import mongoose from 'mongoose';;

const subcriptionSchema = new mongoose.Schema({
  name:{
    type: String,
    required: [true, 'Subscription Name is required'],
    trim: true, 
    minLength: 2,
    maxLength: 100,
  },
    price:{
        type: Number,
        required: [true, 'Subscription price is required'],
        min: [0, 'Price must be greater than 0']
    },
    currency: {
        type: String,
        enum: ['USD', 'EUR', 'GBP', 'INR', 'JPY','GHS','NGN'],
        default: 'USD',
    }, 
    
    frequency: {
        type: String,
        enum: ['daily','weekly','monthly', 'yearly'],
    },

    category:{
            type: String,
            enum: ['sport','lifestyle','entertainment', 'utilities', 'food', 'health', 'finace', 'education', 'other'],
            required: [true, 'Subscription category is required'],
    },

    paymentMethod:{
        type: String,
        required : true,
        timr : true,
    },

    status:{
        type: String,
        enum: ['active', 'cancelled' , 'expired'],
        default: 'active',
    },

    startDate:{
        type:Date,
        required: true,
        validate : (value) => value <= new Date(),
        message: 'Start date must be in the past or today',
    },
    renewalDate:{
        type:Date,
        required: true,
        validate : (value) => value > this.startDate, //might have to change this later to an actual function if arrow funcs dont work
        message: 'Renewal date must be after the start date',
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index:true
    }

}, {timestamps: true});



//Auto-calculate the renewal date if missing
subcriptionSchema.pre(save, (next)=>{
  if(!this.renewalDate){
    const renewalPeriods ={
        daily: 1,
        weekly: 7,
        monthly: 30,
        yearly: 365,
    };

this.renewalDate = new Date(this.startDate)
this.renewalDate.setDate(this.renewalDate.getDate() + renewalPeriods[this.frequency])
}
//Auto-update the status if the renewal date has passed
if(this.renewalDate < new Date()){
    this.status = 'expired';
}
next(); 
})


const Subscription = mongoose.model('Subscription', subcriptionSchema);

export default Subscription;