const express = require("express");
const userRoute = express.Router();

const userController = require("../../controller/users/userController");
const passport = require("passport");
const productController = require("../../controller/users/productController");

//page not found route
userRoute.get("/page-not-found", userController.loadPageNotFound);

//for home page
userRoute.get("/", userController.loadHomePage);

//for login route
userRoute.get("/login", userController.loadLoginPage);
userRoute.post("/login", userController.loginVerification);

//for registeration page
userRoute.get("/signup", userController.loadRegisterPage);
userRoute.post("/signup", userController.signup);

//for otp verification
userRoute.post("/verify-otp", userController.verifyOtp);
userRoute.post("/resend-otp", userController.resendOtp);

//for google authentication
userRoute.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
userRoute.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful login, send user info in session
    req.session.user = req.user;
    res.redirect("/");
  }
);

//for userlogout
userRoute.get("/logout", userController.logout);

//for product management
userRoute.get("/productDetails/:productId", productController.productDetails);

userRoute.get( "/productDetails/combo/:id",productController.loadComboDetails);

module.exports = userRoute;
