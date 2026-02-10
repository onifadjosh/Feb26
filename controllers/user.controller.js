const UserModel = require("../models/user.model")


const createUser=async(req, res)=>{
    const {lastName, email, password, firstName} = req.body
   
    try {
        const user = await UserModel.create(req.body)
    res.status(201).send({
        message:"user created successfully",
        data:{
            lastName,
            email,
            firstName
        }
    })
    } catch (error) {
        console.log(error);
        
        res.status(400).send({
            message:"User creation failed"
        })
    }
}

module.exports= {
    createUser
}

