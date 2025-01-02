const User = require("../../models/userSchema");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

//function to load login page
const loadlogin = async (req, res) => {
  if (req.session.admin) {
    res.redirect("/admin");
  }
  res.render("adminLoginPage");
};

//function to verify login details
const loginverification = async (req, res) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;
    const admin = await User.findOne({ email, isAdmin: true });
    if (admin) {
      const passwordMatch = await bcrypt.compare(password, admin.password);
      console.log("here", passwordMatch);
      if (passwordMatch) {
        req.session.admin = admin;
        return res.redirect("/admin");
      } else {
        return res.render("adminLoginPage", {
          message: "Invalid Username or Password",
        });
      }
    } else {
      return res.render("adminLoginPage", {
        message: "Invalid Username or Password",
      });
    }
  } catch (error) {
    console.log(error);
    res.redirect("/page-not-found");
  }
};

//function to load dashboard
const loaddashboard = async (req, res) => {
  try {
    res.render("admindash");
  } catch (error) {
    console.log(error);
    res.redirect("/page-not-found");
  }
};

//function for loggingout admin page
const logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log(err, "eror destroying session");
        return res.redirect("/admin");
      }
      res.redirect("/admin/login");
    });
  } catch (error) {
    console.log(error, "error during logout");
  }
};

//function to load user list page
const loadUserlist = async (req, res) => {
  try {
    res.render("adminUsers");
  } catch (error) {
    console.log(error);
    res.redirect("/page-not-found");
  }
};

module.exports = {
  loadlogin,
  loginverification,
  loaddashboard,
  logout,
  loadUserlist,
};
