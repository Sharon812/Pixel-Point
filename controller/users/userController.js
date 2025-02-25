const User = require("../../models/userSchema");
const Category = require("../../models/categorySchema");
const Products = require("../../models/productSchema");
const Wishlist = require("../../models/wishlistSchema");
const brand = require("../../models/brandSchema");
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
    const { name, phone, password } = req.body;
    const email = req.body.email.trim().toLowerCase();
    const findUser = await User.findOne({ email: email });
    if (findUser) {
      return res.render("signUpPage", { message: "user already exists" });
    }

    const otp = generateOtp();

    const emailSent = sendVerificationEmail(email, otp);

    if (!emailSent) {
      return res.render("signUpPage", { message: "Unable to sent email" });
    }
    req.session.userOtp = otp;
    req.session.userData = { email, password, name, phone };

    res.render("verifyOtp");
    console.log("otp send", otp);
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
      const profilePhoto = await getPlaceholderImage(user.name);
      console.log(profilePhoto, "prof");
      const saveUserData = new User({
        name: user.name,
        phone: user.phone,
        email: user.email,
        password: passwordHash,
        profilePhoto: profilePhoto,
      });
      await saveUserData.save();

      req.session.user = saveUserData._id;
      res.json({ success: true, redirectUrl: "/" });
    } else {
      res.status(400).json({ success: false, message: "Please try again" });
    }
  } catch (error) {
    console.error("error verifying otp", error);
    res.status(400).json({ success: false, message: "an error try again" });
  }
};

//function to generate placeholdderimage
const getPlaceholderImage = (name) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const encodedInitials = encodeURIComponent(initials); // Fixes any special character issues
  return `https://res.cloudinary.com/dbufv0x2p/image/upload/l_text:Arial_100_bold:${encodedInitials},co_rgb:ffffff,w_200,h_200,c_fit,bo_2px_solid_black,b_rgb:000000/v1/placeholder.jpg`;
};

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
    if (findUser.isBlocked) {
      return res.render("userLoginPage", {
        message: "user is blocked by admin",
      });
    }

    const passwordMatch = await bycrypt.compare(password, findUser.password);
    if (!passwordMatch) {
      return res.render("userLoginPage", { message: "incorrect password" });
    }

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
  loadHomePage,
  verifyOtp,
  resendOtp,
  loadPageNotFound,
  loginVerification,
  logout,
};
