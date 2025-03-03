const User = require("../models/userSchema");

const userCheck = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.render("userLoginPage",{message:"Please login to continue further"});
  }
};

const blockedUser = async (req, res, next) => {
  if (req.session.user) {
    try {
      const id = req.session.user;
      const user = await User.findOne({ _id: id, isBlocked: false });

      if (user) {
        return next();
      } else {
        // User is blocked
        req.session.user = null;
        return res.render("userLoginPage", {
          message: "User is blocked by admin",
        });
      }
    } catch (err) {
      console.error("Error checking user block status:", err);
      return res.redirect("/page-not-found");
    }
  } else {
    next();
  }
};

module.exports = {
  userCheck,
  blockedUser,
};
