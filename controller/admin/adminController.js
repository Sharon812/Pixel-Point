const User = require("../../models/userSchema");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Products = require("../../models/productSchema");

//function to load login page
const loadlogin = async (req, res) => {
  if (req.session.admin) {
    res.redirect("/admin");
  } else {
    res.render("adminLoginPage");
  }
};

//function to verify login details
const loginverification = async (req, res) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;
    const admin = await User.findOne({ email, isAdmin: true });
    if (admin) {
      const passwordMatch = await bcrypt.compare(password, admin.password);
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
    const totalProducts = await Products.findOne({}).countDocuments();
    const totalUsers = await User.findOne({}).countDocuments();
    res.render("admindash", {
      totalProducts: totalProducts,
      users: totalUsers,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/page-not-found");
  }
};

//function for loggingout admin page
const logout = async (req, res) => {
  try {
    req.session.admin = null;
    req.session.save((err) => {
      if (err) {
        console.log("Error saving session:", err);
        return res.redirect("/page-not-found");
      }
      res.redirect("/admin/login");
    });
  } catch (error) {
    console.log("Error at logout:", error);
    res.redirect("/page-not-found");
  }
};

module.exports = {
  loadlogin,
  loginverification,
  loaddashboard,
  logout,
};
