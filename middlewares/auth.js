const User = require("../models/userSchema");

const userAuth = (req, res, next) => {
  if (req.session.user) {
    User.findById(req.session)
      .then((data) => {
        if (data && !data.isBlocked) {
          next();
        } else {
          res.redirect("/login");
        }
      })
      .catch((err) => {
        console.log("error in userAuth middleware", err);
        res.status(500).send("Internal Server Error");
      });
  } else {
    res.redirect("/login");
  }
};

const adminAuth = (req, res, next) => {
  User.findOne({ isAdmin: true })
    .then((data) => {
      if (data) {
        next();
      } else {
        res.redirect("/admin/login");
      }
    })
    .catch((err) => {
      console.log("error in adminAuth middleware", err);
      res.status(500).send("Internal Server Error");
    });
};

module.exports = {
  userAuth,
  adminAuth,
};