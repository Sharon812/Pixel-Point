const express = require("express");
const userRoute = express.Router();

const userController = require("../../controller/users/userController");
const passport = require("passport");
const productController = require("../../controller/users/productController");
const accountController = require("../../controller/users/accountController");
const cartController = require("../../controller/users/cartController");
const shopController = require("../../controller/users/shopController");
const orderController = require("../../controller/users/orderController");
const walletController = require("../../controller/users/walletController");
const wishlistController = require("../../controller/users/wishlistController");
const couponController = require("../../controller/users/couponController");
const userAuth = require("../../middlewares/userAuth");

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
userRoute.get("/verify-otp",userController.getVerifyOtpPage)
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
    req.session.user = req.user._id;
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
userRoute.get(
  "/accountDetails",
  userAuth.userCheck,
  accountController.getAccountDetails
);
userRoute.patch(
  "/accountDetails/:id",
  userAuth.userCheck,
  accountController.updateAccountDetails
);

//for user address details
userRoute.get("/address", userAuth.userCheck, accountController.getAddress);
userRoute.get(
  "/add-address",
  userAuth.userCheck,
  accountController.getAddAddress
);
userRoute.post("/add-address", accountController.addAddress);
userRoute.get(
  "/editAddress/:id",
  userAuth.userCheck,
  accountController.getEditAddress
);
userRoute.patch("/editAddress/:id", accountController.editAddress);
userRoute.delete("/deleteAddreess/:id", accountController.deleteAddress);

//for cart details
userRoute.get("/cart", userAuth.userCheck, cartController.getCart);
userRoute.post("/addCart/:productId/combo/:comboId", cartController.addToCart);
userRoute.delete("/cart/:cartId/item/:itemId", cartController.deleteCartItem);
userRoute.patch("/updateCart", cartController.addquantity);
userRoute.patch("/decreaseQuantity", cartController.decreaseQuantity);

//for shop details
userRoute.get("/shop", shopController.loadShopPage);

//for checkout
userRoute.get("/checkout", userAuth.userCheck, orderController.processCheckout);
userRoute.post("/checkout", orderController.placeOrder);

// Coupon routes for checkout
userRoute.get(
  "/checkout/coupons",
  userAuth.userCheck,
  couponController.getAvailableCoupons
);
userRoute.post(
  "/checkout/apply-coupon",
  userAuth.userCheck,
  couponController.applyCoupon
);

//for order placed
userRoute.get("/orderplaced", userAuth.userCheck, orderController.orderPlaced);
userRoute.get(
  "/orderPending",
  userAuth.userCheck,
  orderController.orderPending
);
userRoute.post(
  "/verify-payment",
  userAuth.userCheck,
  orderController.verifyPayment
);
userRoute.post(
  "/retry-payment",
  userAuth.userCheck,
  orderController.retryPayment
);
userRoute.post(
  "/verify-retry-payment",
  userAuth.userCheck,
  orderController.verifyRetryPayment
);
//for userorder details
userRoute.get("/orders", userAuth.userCheck, accountController.getOrders);
userRoute.get(
  "/orderDetails",
  userAuth.userCheck,
  accountController.getOrderDetails
);
userRoute.patch(
  "/cancelOrder",
  userAuth.userCheck,
  accountController.cancelOrder
);
userRoute.patch("/returnorder", accountController.returnOrder);

//for invoice download
userRoute.get(
  "/invoice/:itemId/:orderId",
  userAuth.userCheck,
  orderController.generateInvoice
);

//for wishlist
userRoute.get("/wishlist", userAuth.userCheck, wishlistController.getWishlist);
userRoute.post("/addToWishlist", wishlistController.addToWishlist);

//for wallet
userRoute.get("/wallet", userAuth.userCheck, walletController.getWallet);
userRoute.post(
  "/add-money",
  userAuth.userCheck,
  walletController.addMoneyToWallet
);
userRoute.post(
  "/verify-addmoney-payment",
  userAuth.userCheck,
  walletController.verifyPayment
);

//for referal offer
userRoute.get("/referaldetails", accountController.getReferallPage);

module.exports = userRoute;
