const express = require("express");
const app = express();

//function to render user login page 
const loadLoginPage = async (req, res) => {
  try {
    res.render("userLoginPage");
  } catch (error) {
    console.log("error at home page");
    res.status(500).send("server error occured");
  }
};

module.exports = {
  loadLoginPage,
};
