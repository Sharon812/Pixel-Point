const User = require("../../models/userSchema");
const Category = require("../../models/categorySchema");
const Products = require("../../models/productSchema");
const Wishlist = require("../../models/wishlistSchema");
const brand = require("../../models/brandSchema");
const Wallet = require("../../models/walletSchema")
const nodemailer = require("nodemailer");
const env = require("dotenv").config();
const bycrypt = require("bcrypt");

//function to render page 404
const loadPageNotFound = async (req, res) => {
  try {
    const user = req.session.user;
    if (user) {
      const userData = await User.findById(user);
      res.render("page-404", {
        user: userData,
      });
    }
    res.render("page-404");
  } catch (error) {
    console.log("error rendering 404 page", error);
    res.status(500).send("server error occured");
  }
};

//function to render user home page
const loadHomePage = async (req, res) => {
  try {
    const user = req.session.user;

    let wishlistProducts = [];

    if (user) {
      userData = await User.findById(user);
      const wishlist = await Wishlist.findOne({ userId: user }).select(
        "product.productId"
      );
      wishlistProducts = wishlist
        ? wishlist.product.map((item) => item.productId.toString())
        : [];
    }

    const refurbishedLaptopsCategory = await Category.findOne({
      name: "Refurbished laptops",
    });

    const laptopsCategory = await Category.findOne({
      name: "Laptops",
    });

    const refurbishedLaptops = await Products.find({
      isBlocked: false,
      category: refurbishedLaptopsCategory._id,
    }).populate({
      path: "brand",
      model: "Brands",
    });

    const laptops = await Products.find({
      isBlocked: false,
      category: laptopsCategory._id,
      brand: { $exists: true, $ne: null },
    }).populate({
      path: "brand",
      model: "Brands",
    });

    // Fetch new arrivals
    const newArrivals = await Products.find({
      isBlocked: false,
    })
      .populate({
        path: "brand",
        model: "Brands",
      })
      .populate("category")
      .sort({ createdAt: -1 })
      .limit(6);

    // Render the home page

    if (user) {
      const userData = await User.findOne({ _id: user });

      return res.render("homePage", {
        user: userData,
        refurbishedLaptops,
        laptops,
        newArrivals,
        wishlistProducts,
      });
    } else {
      return res.render("homePage", {
        refurbishedLaptops,
        laptops,
        newArrivals,
        wishlistProducts,
      });
    }
  } catch (error) {
    console.log("Error at home page", error);
    res.status(500).send("server error occurred");
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

const generateReferralCode = () => {
  return Math.random().toString(36).slice(-6).toUpperCase();
};

const getVerifyOtpPage = async (req,res) => {
  try {
    if(req.session.userData){
      res.render("verifyOtp")
    }else{
      res.redirect("/signup")
    }
  } catch (error) {
    console.log(error,"error at rendering verify otp page")
    res.redirect("/page-not-found")
  }
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
    console.log(req.body)
    const { name, phone, password  } = req.body;
    const email = req.body.email.trim().toLowerCase();
    const refferalCode = req.body.refferalCode.trim().toUpperCase();
    const findUser = await User.findOne({ email: email });
    if (findUser) {
      return res.status(400).json({success:false,message:"User already exists"});
    }
    if(refferalCode){
      const refferalCodeUser = await User.findOne({refferalCode : refferalCode})
      console.log(refferalCodeUser)
      if(!refferalCodeUser){
        return res.status(400).json({success:false,message:"Invalid Refferal Code"})
      }
    }

    const otp = generateOtp();

    const emailSent = sendVerificationEmail(email, otp);

    if (!emailSent) {
      return res.status(400).json({success:false,message:"Unable to send email"});
    }


    req.session.userOtp = otp;
    req.session.userData = { email, password, name, phone , refferalCode};
    console.log("otp send", otp);

    return res.json({ success: true, redirectUrl: "/verify-otp" });
  } catch (error) {
    console.error("error in save usr", error);
    res.status(500).redirect("/page-not-found");
  }
};

//function to secure password
const securePassword = async (password) => {
  try {
    const passwordHash = await bycrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log("error at securing password", error);
    return false;
  }
};

//function to do verify otp
const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    console.log("otp", otp);

    if (otp === req.session.userOtp) {
      const user = req.session.userData;
      const passwordHash = await securePassword(user.password);
      const profilePhoto = await generateProfilePhotoUrl(user.name);

      const saveUserData = new User({
        name: user.name,
        phone: user.phone,
        email: user.email,
        password: passwordHash,
        profilePhoto: profilePhoto,
        refferalCode:generateReferralCode()
      });
      const newUserData =  await saveUserData.save();
      if(user.refferalCode){
        const refferalCodeUser = await User.findOne({refferalCode : user.refferalCode})
        if(refferalCodeUser){
          refferalCodeUser.refferalUsers.push({
            userId:newUserData._id,
            userName:newUserData.name,
          })
          await refferalCodeUser.save()
          await addRefferalMoneyToNewUserWallet(newUserData._id,refferalCodeUser.name)
          await addRefferalMoneytoRefferalUser(refferalCodeUser._id,newUserData.name)
        }
      }
      req.session.user = newUserData._id;
      res.json({ success: true, redirectUrl: "/" });
    } else {
      res.status(400).json({ success: false, message: "Please try again" });
    }
  } catch (error) {
    console.error("error verifying otp", error);
    res.status(400).json({ success: false, message: "an error try again" });
  }
};

//function to add money to user wallet
async function addRefferalMoneyToNewUserWallet(userId,name){
    let wallet = await Wallet.create({
      user:userId,
      balance:500,
      transactions:[
        {
          type:"credit",
          amount:500,
          date:new Date(),
          description:`Money added for refferal by ${name}`
        }
      ]
    })
    await wallet.save();
}

async function addRefferalMoneytoRefferalUser(userId,name){
    let wallet = await Wallet.findOne({ user: userId });
       if (!wallet) {
         wallet = await Wallet.create({
           user: userId,
           balance: 500,
           transactions: [
             {
               type: "credit",
               amount: 500,
               date: new Date(),
               description: `Money added to wallet for reffering ${name}`,
             },
           ],
         });
       } else {
         wallet.balance += 500;
         wallet.transactions.push({
           type: "credit",
           amount: 500,
           date: new Date(),
           description: `Money added to wallet for reffering ${name}`,
          });
         await wallet.save();
       }
   
}

//function to generate placeholdderimage
function generateProfilePhotoUrl(fullName) {
  if (!fullName || typeof fullName !== 'string') {
      throw new Error('Input must be a non-empty string');
  }

  const initials = fullName.trim()[0].toUpperCase();  

  const cloudName = process.env.CLOUDINARY_CLOUD; 
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload/`;
  
  const transformations = [
      'w_300,h_300',           // Increased to 300x300 for higher resolution
      'c_fill',               // Fill crop mode
      'g_center',             // Center gravity
      'r_max',                // Circular shape
      'b_rgb:3267d6',         // Slightly darker blue for better contrast (was 4285f4)
      `l_text:Arial_100_bold:${encodeURIComponent(initials)}`, // Larger, bolder text (was 80)
      'fl_layer_apply',       // Apply the text layer
      'g_center',             // Center the text
      'co_rgb:ffffff',        // White text color
      'q_auto:best'           // Automatic quality optimization
  ];

  const cloudinaryUrl = `${baseUrl}${transformations.join(',')}/placeholder-headshot_gtsvi5_profileavatar_booggl`;

  return cloudinaryUrl;
}


//function for resending otp
const resendOtp = async (req, res) => {
  try {
    const { email } = req.session.userData;
    if (!email) {
      return res
        .status(400)
        .status({ success: false, message: "email not found " });
    }

    const otp = generateOtp();
    req.session.userOtp = otp;

    const emailSent = await sendVerificationEmail(email, otp);

    if (emailSent) {
      console.log("resend email send ", otp);
      res.status(200).json({ success: true, message: "otp send successfully" });
    } else {
      res.status(500).json({ success: false, message: "Otp failed to send" });
    }
  } catch (error) {
    console.log("Error at resend otp", error);
    res.status(500).json({ success: false, message: "Internal server error " });
  }
};
//function to render user login page
const loadLoginPage = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.render("userLoginPage");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log("error at server page");
    res.status(500).send("server error occured");
  }
};

//function to verify user login details
const loginVerification = async (req, res) => {
  try {
    const { email, password } = req.body;

    const findUser = await User.findOne({ isAdmin: 0, email: email });
    if (!findUser) {
      return res.render("userLoginPage", { message: "user not found" });
    }
    console.log(findUser,"findUser")
    if (findUser.isBlocked) {
      return res.render("userLoginPage", {
        message: "user is blocked by admin",
      });
    }

    const passwordMatch = await bycrypt.compare(password, findUser.password);
    if (!passwordMatch) {
      return res.render("userLoginPage", { message: "incorrect password" });
    }
    console.log(findUser._id,"findUserid")

    req.session.user = findUser._id;

    res.redirect("/");
  } catch (error) {
    console.log("error at login page", error);
    res.render("userLoginPage", {
      message: "Login failed , please try again later",
    });
  }
};

//for logout
const logout = async (req, res) => {
  try {
    req.session.user = null;
    req.session.save((err) => {
      if (err) {
        console.log("Error saving session:", err);
        return res.redirect("/page-not-found");
      }
      res.redirect("/");
    });
  } catch (error) {
    console.log("Error at logout:", error);
    res.redirect("/page-not-found");
  }
};

module.exports = {
  loadLoginPage,
  loadRegisterPage,
  signup,
  getVerifyOtpPage,
  loadHomePage,
  verifyOtp,
  resendOtp,
  loadPageNotFound,
  loginVerification,
  logout,
  generateReferralCode
};
