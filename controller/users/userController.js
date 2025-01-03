
const User = require('../../models/userSchema');
const nodemailer = require('nodemailer');
const env = require('dotenv').config();
const bycrypt = require("bcrypt");

//function to render page 404
const loadPageNotFound = async (req, res) => {
  try {
    res.render("page-404");
  } catch (error) {
    console.log("error rendering 404 page", error);
    res.status(500).send("server error occured");
  }
};

//function to render user home page
const loadHomePage = async (req, res) => {
  try {
    return res.render("homePage");
  } catch (error) {
    console.log("Error at home page");
    res.status(500).send("server error occured");
  }
};

//function to render registeration page
const loadRegisterPage = async (req, res) => {
  try {
    return res.render("signUpPage");
  } catch (error) {
    console.log("Error at home page");
    res.status(500).send("server error occured");
  }
};

//function to generate otp
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

//function to send email
async function sendVerificationEmail(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: "Verify your account",
      text: `Your otp is ${otp}`,
      html: `<b> Your otp is ${otp}</b>`,
    });

    return info.accepted.length > 0;
  } catch (error) {
    console.log("error sending email", error);
    return false;
  }
}

//function on verifying signup details
const signup = async (req, res) => {
  try {
    console.log(req.body);
    const { name, phone, email, password, cpassword } = req.body;

    if (password !== cpassword) {
      return res.render("signUpPage", { message: "password do not matched" });
    }

    const findUser = await User.findOne({ email });
    if (findUser) {
      return res.render("signUpPage", { message: "user already exists" });
    }

    const otp = generateOtp();

    const emailSent = sendVerificationEmail(email, otp);

    if (!emailSent) {
      return res.json("Unable to send email");
    }
    req.session.userOtp = otp;
    req.session.userData = { email, password, name, phone };

    res.render("verifyOtp");
    console.log("otp send", otp);
  } catch (error) {
    console.error("error in save usr", error);
    res.status(500).send("internal server error");
  }
};

//function to secure password
const securePassword = async (password) => {
  try {
    const passwordHash = await bycrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {}
};

//function to do verify otp
const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    console.log("otp", otp);

    if (otp === req.session.userOtp) {
      const user = req.session.userData;
      const passwordHash = await securePassword(user.password);

      const saveUserData = new User({
        name: user.name,
        phone: user.phone,
        email: user.email,
        password: passwordHash,
      });
      await saveUserData.save();
      req.session.user = saveUserData._id;
      res.json({ success: true, redirectUrl: "/" });
    } else {
      res.status(400).json({ success: false, message: "Please try again" });
    }
  } catch (error) {
    console.error("error verifying otp", error);
    res.status(400).json({ success: false, message: "an error  r try again" });
  }
};

//function for resending otp
const resendOtp = async (req,res)=> {
    try {
      
      const {email} = req.session.userData;
      console.log("emailskdio",email)
      if(!email){
        return res.status(400).status({success:false, message:"email not found in session"})
      }

      const otp = generateOtp()
      req.session.userOtp = otp;

      const emailSent = await sendVerificationEmail(email,otp)

      if(emailSent){
        console.log("resend email send ",otp)
        res.status(200).json({success:true,message:"otp send successfully"})
      }else{
        res.status(500).json({success:false,message:"Otp failed to send"})
      }

    } catch (error) {
      console.log("Error at resend otp",error)
      res.status(500).json({success:false,message:"Internal server error "})

    }
}
//function to render user login page
const loadLoginPage = async (req, res) => {
  try {
    if(!req.session.user){
      return res.render('userLoginPage');
    }else{
      res.redirect('/')
    }
  } catch (error) {
    console.log('error at server page');
    res.status(500).send('server error occured');
  }
};

//function to verify user login details
const loginVerification = async (req,res) => {
  try {
    
    const {email,password} = req.body
    
    const findUser = await User.findOne({isAdmin:0,email:email})
    if(!findUser){
      return res.render('userLoginPage',{message:"user not found"})
    }
    if(findUser.isBlocked){
      return res.render('userLoginPage',{message:"user is blocked by admin"})
    }

    const passwordMatch = await bycrypt.compare(password,findUser.password)
    if(!passwordMatch){
      return res.render('userLoginPage',{message:"incorrect password"})
    }

    req.session.user = findUser._id

    res.redirect('/')
  } catch (error) {
    console.log('error at login page', error);
    res.render('userLoginPage',{message:"Login failed , please try again later"})
  }
}
  
module.exports = {
    loadLoginPage,
    loadRegisterPage,
    signup,
    loadHomePage,
    verifyOtp,
    resendOtp,
    loadPageNotFound,
    loginVerification
}