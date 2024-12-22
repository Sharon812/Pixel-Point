const express = require("express");
const userRoute = express.Router();

const userController = require("../Controller/users/userController");

//for login route
userRoute.get("/login", userController.loadLoginPage);

module.exports = userRoute;
