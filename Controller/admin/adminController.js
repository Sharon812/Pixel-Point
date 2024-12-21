const express = require("express");
const app = express();

//for admin page dashboard rendering
const loadAdminDashboard = async (req, res) => {
  try {
    return res.render("admindashboard");
  } catch (error) {
    console.log("error at home page");
    res.status(500).send("server error occured");
  }
};

module.exports = {
  loadAdminDashboard,
};
