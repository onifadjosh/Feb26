const UserModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const mailSender = require("../middleware/mailer");
const otpgen = require("otp-generator");
const OTPModel = require("../models/otp.model");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODE_MAIL,
    pass: process.env.NODE_PASS,
  },
});

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

    const renderMail = await mailSender("welcomeMail.ejs", { firstName });

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

    let mailOptions = {
      from: process.env.NODE_MAIL,
      bcc: [
        email,
        "Nunyadamnbusiness0099@gmail.com",
        "Holuwalovely@gmail.com",
        "mubarakaduragbemi@gmail.com",
        "aishaatinukeaisha@gmail.com",
        "Ibrahim018.yi@gmail.com",
        "onifadjosh@gmail.com"
      ],
      subject: `Welcome, ${firstName}`,
      html: renderMail,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
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
    const token = await jwt.sign(
      { id: isUser._id, roles: isUser.roles },
      process.env.JWT_SECRET,
      {
        expiresIn: "5h",
      }
    );
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
  const user = req.user.roles;
  try {
    if (user !== "admin") {
      res.status(403).send({
        message: "Forbidden request",
      });

      return;
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

const verifyUser = async (req, res, next) => {
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

      next();
    });
  } catch (error) {
    res.status(401).send({
      message: "user unauthorized",
    });
  }
};

const getMe = async (req, res) => {
  console.log(req.user.id);
  // const {id} = req.user
  // console.log(id);

  try {
    const user = await UserModel.findById(req.user.id).select("-password");

    res.status(200).send({
      message: "user retreived successfully",
      data: user,
    });
  } catch (error) {
    console.log(error);

    res.status(404).send({
      message: "user not found",
    });
  }
};

const requestOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const isUser = await UserModel.findOne({ email });

    if (!isUser) {
      res.status(404).send({
        message: "account not found",
      });
      return;
    }

    const sendOTP = otpgen.generate(4, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
      digits: true,
    });

    //save their otp and mail in the db
    //send them a mail with their otp
    const user = await OTPModel.create({ email, otp: sendOTP });

    const otpMailContent = await mailSender("otpMail.ejs", { otp: sendOTP });

    res.status(200).send({
      message: "Otp sent successfully",
    });

    let mailOptions = {
      from: process.env.NODE_MAIL,
      bcc: [
        email,
        "Nunyadamnbusiness0099@gmail.com",
        "Holuwalovely@gmail.com",
        "mubarakaduragbemi@gmail.com",
        "aishaatinukeaisha@gmail.com",
        "Ibrahim018.yi@gmail.com",
      ],
      subject: `OTP CODE`,
      html: otpMailContent,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Otp request failed",
    });
  }
};

const forgotPassword = async (req, res) => {
  const { otp, email, newPassword } = req.body;

  try {
    const isUser = await OTPModel.findOne({ email });

    if (!isUser) {
      res.status(404).send({
        message: "Invalid OTP",
      });

      return;
    }

    let isMatch = otp == isUser.otp;

    if (!isMatch) {
      res.status(404).send({
        message: "Invalid OTP",
      });

      return;
    }
    const saltRound = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(newPassword, saltRound);
    const user = await UserModel.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    res.status(200).send({
      message:"Password updated successfully"
    })
  } catch (error) {

    res.status(404).send({
      message: "Invalid OTP",
    });
  }
};


const changePassword=async(req, res)=>{
  const{oldPassword, newPassword}= req.body

  try {

    const isUser= await UserModel.findById(req.user.id)

    if(!isUser){
      res.status(404).send({
        message: "Invalid User",
      });

      return
    }

    const isMatch = await bcrypt.compare(oldPassword, isUser.password)

    if(!isMatch){
      res.status(404).send({
        message: "Wrong password!",
      });

      return
    }


    const saltRound = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(newPassword, saltRound);

    const user = await UserModel.findByIdAndUpdate({_id:req.user.id}, {password:hashedPassword}, {new:true})

    res.status(200).send({
      message:"Password changed successfully"
    })
  } catch (error) {
    console.log(error);
    
    res.status(404).send({
      message: "Failed to change password",
    });
  }
}

module.exports = {
  createUser,
  editUser,
  getAllUser,
  deleteUser,
  login,
  verifyUser,
  getMe,
  requestOTP,
  forgotPassword,
  changePassword
};
