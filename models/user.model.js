import mongoose from "mongoose";
const userSchema = new mongoose.Schema({

    name:{
        type: String,
        required:[true, 'User Name is required'],
        trim: true,
        minLength: 2,
        maxLength: 50,
    }, 
    email: {
        type: String,
        required:[true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 5,
        maxLength: 100,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address'],
    },


    password: {
        type: String,
        required:[true, 'Password is required'],
        minLength: 6,
        
    },
}, {timestamps: true});

const User = mongoose.model('User', userSchema);

export default User;

//This is how the data will look like when a user is created
//{name: 'John Doe', email:jonny@email.com, password: 'password123'}