const sessionVerification = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};

module.exports = sessionVerification;
// middleware ti verify weather admin session is present or not
