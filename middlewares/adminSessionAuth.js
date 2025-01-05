// const sessionVerification = (req, res, next) => {
//   if (req.session.admin || req.path === "/admin/login") {
//     next();
//   } else {
//     if (req.originalUrl !== "/admin/login") {
//       res.redirect("/admin/login");
//     } else {
//       next();
//     }
//   }
// };
const sessionVerification = (req, res, next) => {
  if (req.session.admin || req.path === "/admin/login") {
    next();
  } else {
    if (req.originalUrl !== "/admin/login") {
      res.redirect("/admin/login");
    } else {
      next();
    }
  }
};

module.exports = sessionVerification;
// middleware ti verify weather admin session is present or not
