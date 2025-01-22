const express = require("express");
const userRoute = express.Router();

const userController = require("../../controller/users/userController");
const passport = require("passport");
const productController = require("../../controller/users/productController");
const accountController = require("../../controller/users/accountController");
const cartController = require("../../controller/users/cartController");
const shopController = require("../../controller/users/shopController");
const orderController = require("../../controller/users/orderController");

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
userRoute.get("/productDetails/combo/:id", productController.loadComboDetails);

//for forgot password
userRoute.get("/forgot-password", accountController.getForgotPassword);
userRoute.post("/forgot-password", accountController.forgotPasswordOtp);
userRoute.post(
  "/verify-forgotPassword-otp",
  accountController.verifyForgotPasswordOtp
);
userRoute.get("/reset-password/:token", accountController.getResetPassword);
userRoute.post("/reset-password/:token", accountController.resetPassword);

//for account details
userRoute.get("/accountDetails", accountController.getAccountDetails);
userRoute.patch("/accountDetails/:id", accountController.updateAccountDetails);

//for user address details
userRoute.get("/address", accountController.getAddress);
userRoute.get("/add-address", accountController.getAddAddress);
userRoute.post("/add-address", accountController.addAddress);
userRoute.get("/editAddress/:id", accountController.getEditAddress);
userRoute.patch("/editAddress/:id", accountController.editAddress);
userRoute.delete("/deleteAddreess/:id", accountController.deleteAddress);

//for cart details
userRoute.get("/cart", cartController.getCart);
userRoute.post("/addCart/:productId/combo/:comboId", cartController.addToCart);
userRoute.delete("/cart/:cartId/item/:itemId", cartController.deleteCartItem);

//for shop details
userRoute.get("/shop", shopController.loadShopPage);

//for checkout
userRoute.get("/checkout", orderController.processCheckout);
module.exports = userRoute;
