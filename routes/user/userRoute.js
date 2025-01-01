const express = require('express');
const userRoute = express.Router();

const userController = require("../../controller/users/userController");

//for home page
userRoute.get('/', userController.loadHomePage);

//for login route
userRoute.get('/login', userController.loadLoginPage)

//for registeration page
userRoute.get('/signup', userController.loadRegisterPage);
userRoute.post('/signup',userController.signup)

userRoute.post('/verify-otp',userController.verifyOtp)

module.exports = userRoute;
