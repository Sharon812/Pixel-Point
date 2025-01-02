const express = require("express");
const router = express.Router();
const adminController = require("../../controller/admin/adminController");
const customerController = require("../../controller/admin/customerController");
const { userAuth, adminAuth } = require("../../middlewares/auth");
const sessionCheck = require("../../middlewares/adminSessionAuth");
const catController = require("../../controller/admin/categoryController");
const productCont = require("../../controller/admin/productController");
// for login page
router.get("/login", adminController.loadlogin);
router.post("/login", adminController.loginverification);

// for dashboard
router.get("/", sessionCheck, adminController.loaddashboard);

//for logout
router.get("/logout", adminController.logout);

//for user list page
router.get("/users", sessionCheck, adminAuth, customerController.userInfo);
//for blocking user
router.get("/block-user", customerController.userBlocked);
router.get("/unblock-user", customerController.userUnblocked);

//for category list page
router.get("/category", sessionCheck, catController.categoryInfo);
router.post("/addCategory", sessionCheck, catController.addCategory);
router.get("/deleteCategory", sessionCheck, catController.deleteCategory);
router.get("/editCategory", sessionCheck, catController.geteditCategory);
router.post("/editCategory/:id", sessionCheck, catController.editCategory);

//for product list page
router.get("/addProducts", adminAuth, sessionCheck, productCont.getProductInfo);



module.exports = router;
