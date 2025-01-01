const express = require('express');
const userRoute = express.Router();

const userController = require("../../controller/users/userController");
const passport = require('passport');

//for home page
userRoute.get('/', userController.loadHomePage);

//for login route
userRoute.get('/login', userController.loadLoginPage)

//for registeration page
userRoute.get('/signup', userController.loadRegisterPage);
userRoute.post('/signup',userController.signup)

//for otp verification
userRoute.post('/verify-otp',userController.verifyOtp)
userRoute.post('/resend-otp',userController.resendOtp)

//for google authentication
userRoute.get('/auth/google', passport.authenticate('google', {scope:['profile','email']}));
userRoute.get('/auth/google/callback',passport.authenticate('google',{failureRedirect : '/signup'}),(req,res) => {
    res.redirect('/')
});
 
module.exports = userRoute;
