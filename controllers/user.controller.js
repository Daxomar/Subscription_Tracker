import User from '../models/user.model.js'



export const getUser = async (req, res, next ) =>{

  try{
    const {id} = req.user
    console.log("this is what i am currently debugging", id); 
        const user = await User.findById(id).select('-password');

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








//ACCOUNT CREATION BY ADMIN DIRECTLY
export const creatAccountByAdmin = async (req, res, next) =>{

   const session = await mongoose.startSession();
     session.startTransaction(); // I actually learnt this in class for relational dbs, makes the database atomic
     //all or nothing, no halfway authentications, it either works or it doesn't


     const {id, role} = req.user

    // So that we don't have to send empty details to the server
     const {name, email, password} = req.body;
    if(!name|| !email || !password){
        return res.json(
            {
                success: false,
                message: 'Missing Details, Please provide them'
            }
        )
    }

    //Making sure the person making the update request is the admin first
    if(!req.user || req.user.role !== 'admin'){
        const error = new Error('Unauthorized to create admin accounts');
            error.statusCode = 403;
            throw error;
            }


      try{      
        //Check if user already exists
        const existingUser = await User.findOne({email});

        if(existingUser){
            const error = new Error('User already exists')
            error.statusCode = 409;
            throw error;
        }
    
        //If newuser doesn't already exit continue flow and hash created passwords
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUsers = await User.create([{name, email, password: hashedPassword }], {session}); // I might change this later for just singleNewUser creation
       
        
        
         //I DID NOT AUTOMATICALLY GENERATE TOKEN AND SET TO COOKIES, CAUSE I DON'T WANT THE ACCOUNT TO BE IMMEDIATELY LOGGED IN AFTER CREATION
        await session.commitTransaction();
        session.endSession();


     
       res.status(201).json({
        success: true,
        message: `User created successfully by ${id} role: ${role}, PLEASE LOG IN `,
        data:{
            user:newUsers[0],
        }
       });


       // Sends the welcome email 
        await sendWelcomeEmail({ 
            to: email, 
            userName: name 
            })



      } catch(error){
            await session.abortTransaction();
            session.endSession();
            next(error);
        }
    
}



//ACCOUNT UPDATE BY ADMIN DIRECTLY
export const updateUserByAdmin = async (req, res, next)=>{
 
    try{
        const {id: user} = req.param;  //user id from request params
        const {id:loggedInUser, role} = req.user; // current logged-in user supposedly admin from middleware trying to update a specific account by using :id params

        const updateData = req.body
    }catch(error){
        console.log(error)
        next(error)
    }
     
}