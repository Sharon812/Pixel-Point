const express = require('express');
const app = express();
const User = require('../../models/userSchema');
const nodemailer = require('nodemailer');
const env = require('dotenv').config();
const bycrypt = require('bcrypt')

//function to render user login page
const loadLoginPage = async (req, res) => {
  try {
    return res.render('userLoginPage');
  } catch (error) {
    console.log('error at home page');
    res.status(500).send('server error occured');
  }
};

module.exports = {
    loadLoginPage
}