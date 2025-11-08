import User from '../models/user.model.js'
export const getUser = async (req, res, next) => {

    try {
        const { id } = req.user
        console.log("this is what i am currently debugging", id);
        const user = await User.findById(id).select('-password');

        // const user = await User.findById(req.params.id).select('-password'); // brings eveything out aside from the password of a user

        if (!user) {
            const error = new Error('User not found')
            error.statusCode = 404;
            throw error
        }

        const safeUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isAccountVerified: user.isAccountVerified,
            createdAt: user.createdAt,
        };

        res.status(200).json({ sucess: true, data: safeUser }) // Right now i am pushing all the user details, would have to make it more specific


        // res.status(200).json({
        //   success: true,
        //   userData:{
        //     name:user.name,
        //     isAccountVerified: user.isAccountVerified
        //   }
        // })


    } catch (error) {

        next(error)

    }
}



//GET USERS BY ADMIN
export const getUsers = async (req, res, next) => {

    try {
        const { id, email, role } = req.user;
        console.log("this is what i am currently debugging", id);
  

        //Pagination setup
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 2;
        const skip = (page - 1) * limit;



        // Search setup 
        const search = req.query.search ? req.query.search.trim() : "";


        // Build search query
        const query = search
            ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { role: { $regex: search, $options: "i" } },
                ],
            }
            : {};



        //Fetch total users count matching the query, if no query it just returns all users in the db
        const totalUsers = await User.countDocuments(query);


        // Fetch paginated users using search query if there is any
        const users = await User.find(query)
            .select('-password') // Exclude password
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // optional: newest first





        // Handle empty search results or no users gracefully doesnt even go to the next res 
        if (!users || users.length === 0) {
            return res.status(200).json({
                success: true,
                users: [],
                message: search
                    ? "No users matched your search query"
                    : "No users found in the database",
                pagination: {
                    currentPage: page,
                    totalPages: 0,
                    totalUsers: 0,
                    limit,
                    hasNextPage: false,
                    hasPrevPage: false,
                    nextPage: null,
                    prevPage: null,
                },
            });
        }




        //Clean users model i can return to the frontend safely(Secured)
        const safeUsers = users.map(user => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isAccountVerified: user.isAccountVerified,
            createdAt: user.createdAt,
        }));





        //paginated Info
        const hasMore = page * limit < totalUsers;
        const totalPages = Math.ceil(totalUsers / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;



        //Actual data returned should all go well, either via searching or simple viewing the users in my database
        res.status(200).json({
            success: true,
            users: safeUsers,
            message: ` Here are all the users of my app, Request made by ${role} with id:${id}`,
            pagination: {
                currentPage: page,
                totalPages,
                totalUsers,
                limit,
                hasNextPage,
                hasPrevPage,
                nextPage: hasNextPage ? page + 1 : null,
                prevPage: hasPrevPage ? page - 1 : null,
            }
        }) // Right now i am pushing all the user details, would have to make it more specific




    } catch (error) {

        // Handle custom errors with statusCode
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }

        // Handle any other unexpected errors
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });

        //next() will be used later when i create my middlewares properly

    }
}








//ACCOUNT CREATION BY ADMIN DIRECTLY
export const creatAccountByAdmin = async (req, res, next) => {

    const session = await mongoose.startSession();
    session.startTransaction(); // I actually learnt this in class for relational dbs, makes the database atomic
    //all or nothing, no halfway authentications, it either works or it doesn't


    const { id, role } = req.user

    // So that we don't have to send empty details to the server
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.json(
            {
                success: false,
                message: 'Missing Details, Please provide them'
            }
        )
    }

    //Making sure the person making the update request is the admin first
    if (!req.user || req.user.role !== 'admin') {
        const error = new Error('Unauthorized to create admin accounts');
        error.statusCode = 403;
        throw error;
    }


    try {
        //Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            const error = new Error('User already exists')
            error.statusCode = 409;
            throw error;
        }

        //If newuser doesn't already exit continue flow and hash created passwords
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUsers = await User.create([{ name, email, password: hashedPassword }], { session }); // I might change this later for just singleNewUser creation



        //I DID NOT AUTOMATICALLY GENERATE TOKEN AND SET TO COOKIES, CAUSE I DON'T WANT THE ACCOUNT TO BE IMMEDIATELY LOGGED IN AFTER CREATION
        await session.commitTransaction();
        session.endSession();



        res.status(201).json({
            success: true,
            message: `User created successfully by ${id} role: ${role}, PLEASE LOG IN `,
            data: {
                user: newUsers[0],
            }
        });


        // Sends the welcome email 
        await sendWelcomeEmail({
            to: email,
            userName: name
        })



    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }

}



//ACCOUNT UPDATE BY ADMIN DIRECTLY
export const updateUserByAdmin = async (req, res, next) => {

    try {
        const { id: user } = req.param;  //user id from request params
        const { id: loggedInUser, role } = req.user; // current logged-in user supposedly admin from middleware trying to update a specific account by using :id params

        const updateData = req.body
    } catch (error) {
        console.log(error)
        next(error)
    }

}