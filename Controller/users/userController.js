const express = require("express");
const app = express();

const loadHomePage = async (req, res) => {
  try {
  } catch (error) {
    console.log("error at home page");
    res.status(500).send("server error occured");
  }
};

module.exports = {
  loadHomePage,
};
