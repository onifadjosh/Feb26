const UserModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createUser = async (req, res) => {
  const { lastName, email, password, firstName } = req.body;

  try {
    const saltround = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, saltround);

    const user = await UserModel.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "5h",
    });
    res.status(201).send({
      message: "user created successfully",
      data: {
        lastName,
        email,
        firstName,
        roles: user.roles,
      },
      token,
    });
  } catch (error) {
    console.log(error);

    if (error.code == 11000) {
      res.status(400).send({
        message: "User already registered",
      });
    } else {
      res.status(400).send({
        message: "User creation failed",
      });
    }
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const isUser = await UserModel.findOne({ email });
    if (!isUser) {
      res.status(404).send({
        message: "Invalid credentials",
      });

      return;
    }

    const isMatch = await bcrypt.compare(password, isUser.password);
    if (!isMatch) {
      res.status(404).send({
        message: "Invalid credentials",
      });

      return;
    }
    const token = await jwt.sign({ id: isUser._id, roles: isUser.roles }, process.env.JWT_SECRET, {
      expiresIn: "5h",
    });
    res.status(200).send({
      message: "user logged in successfully",
      data: {
        email: isUser.email,
        roles: isUser.roles,
        firstName: isUser.firstName,
        lastName: isUser.lastName,
      },
      token,
    });
  } catch (error) {
    console.log(error);

    res.status(404).send({
      message: "Invalid credentials",
    });
  }
};

const editUser = async (req, res) => {
  const { firstName, lastName } = req.body;
  const { id } = req.params;

  try {
    let allowedUpdate = {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
    };
    const newUser = await UserModel.findByIdAndUpdate(id, allowedUpdate);
    res.status(200).send({
      message: "User updated successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(400).send({
      message: "User update failed",
    });
  }
};

const getAllUser = async (req, res) => {

  const user=req.user.roles
  try {

    if(user!=='admin'){
      res.status(403).send({
        message:"Forbidden request"
      })

      return
    }

    let users = await UserModel.find().select("-roles -password");
    // let users = await UserModel.find()
    res.status(200).send({
      message: "users retrieved successfully",
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(404).send({
      message: "users not found",
    });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const isDeleted = await UserModel.findByIdAndDelete(id);

    if (!isDeleted) {
      res.status(400).send({
        message: "user failed to delete",
      });
      return;
    }

    res.status(204).send({
      message: "user deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(400).send({
      message: "user failed to delete",
    });
  }
};

const verifyUser = async(req, res, next) => {
  try {
    const token = req.headers["authorization"].split(" ")[1]
    ? req.headers["authorization"].split(" ")[1]
    : req.headers["authorization"].split(" ")[0];



  jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
    if (err) {
      res.status(401).send({
        message: "user unauthorized",
      });
      return;
    }

    console.log(decoded);

    req.user = decoded;

    next()
  });
  } catch (error) {
    res.status(401).send({
      message:"user unauthorized"
    })
  }
};


const getMe=async(req, res)=>{
  console.log(req.user.id);
  // const {id} = req.user
  // console.log(id);
  
  try {
    const user =await UserModel.findById(req.user.id).select("-password")

    res.status(200).send({
      message:"user retreived successfully",
      data:user
    })
  } catch (error) {
    console.log(error);
    
    res.status(404).send({
      message:"user not found"
    })
  }
  

}

module.exports = {
  createUser,
  editUser,
  getAllUser,
  deleteUser,
  login,
  verifyUser,
  getMe
};
