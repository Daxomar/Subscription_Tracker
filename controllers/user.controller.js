import User from '../models/user.model.js'



export const getUser = async (req, res, next ) =>{

  try{
    const {userId} = req.body;
    console.log("this is what i am currently debugging", userId); 
        const user = await User.findById(userId).select('-password');

    // const user = await User.findById(req.params.id).select('-password'); // brings eveything out aside from the password of a user

    if(!user){
        const error = new Error('User not found')
        error.statusCode = 404;
        throw error
    }

    res.status(200).json({sucess:true, data: user}) // Right now i am pushing all the user details, would have to make it more specific
   
   
    // res.status(200).json({
    //   success: true,
    //   userData:{
    //     name:user.name,
    //     isAccountVerified: user.isAccountVerified
    //   }
    // })

    
  }catch(error){
    
    next(error)

  }
}




export const getUsers = async (req, res, next ) =>{

  try{
    const {id, email, role} = req.user;
    console.log("this is what i am currently debugging", id); 
        const users = await User.find();

    // const user = await User.findById(req.params.id).select('-password'); // brings eveything out aside from the password of a user

    if(!users){
        const error = new Error('There are no users in the DB')
        error.statusCode = 404;
        throw error
    }

    res.status(200).json({sucess:true, data: users, message:` Here are all the users of my app, Request made by ${role} with id:${id}
      `}) // Right now i am pushing all the user details, would have to make it more specific
   
   
    // res.status(200).json({
    //   success: true,
    //   userData:{
    //     name:user.name,
    //     isAccountVerified: user.isAccountVerified
    //   }
    // })

    
  }catch(error){
    
    next(error)

  }
}