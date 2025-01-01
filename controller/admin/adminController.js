const User = require("../../models/userSchema");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

//function to load login page
const loadlogin = async (req, res) => {
  if (req.session.admin) {
    res.redirect("/admin/dashboard");
  }
  res.render("adminLoginPage", { message: null });
};

//function to verify login details
const loginverification = async (req, res) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;
    const admin = await User.findOne({ email, isAdmin: true });
    console.log(admin);
    if (admin) {
      const passwordMatch = bcrypt.compare(password, admin.password);

      if (passwordMatch) {
        req.session.admin = admin;
        return res.redirect("/admin/dashboard");
      } else {
        return res.redirect("/admin/login");
      }
    }
  } catch (error) {
    console.log(error);
    res.redirect("/page-not-found");
  }
};

//function to load dashboard
const loaddashboard = async (req, res) => {
  if (req.session.admin) {
    try {
      res.render("admindash");
    } catch (error) {}
  }
};

module.exports = {
  loadlogin,
  loginverification,
  loaddashboard,
};
