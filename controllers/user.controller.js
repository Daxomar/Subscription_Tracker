import User from '../models/user.model.js'

export const getUsers = async (req, res, next ) =>{

  try{

    const users = await User.find();
    res.status(200).json({sucess:true, data: users})
    
  }catch(error){
    next(error)
  }
}

export const getUser = async (req, res, next ) =>{

  try{
    const {userId} = req.body;
    console.log("this is what i am currently debugging", userId); 
        const user = await User.findById(userId).select('-passsword');

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