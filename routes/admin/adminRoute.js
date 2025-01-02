const express = require("express");
const router = express.Router();
const adminController = require("../../controller/admin/adminController");
const customerController = require("../../controller/admin/customerController");
const { userAuth, adminAuth } = require("../../middlewares/auth");
const sessionCheck = require("../../middlewares/adminSessionAuth");
const catController = require("../../controller/admin/categoryController");

// for login page
router.get("/login", adminController.loadlogin);
router.post("/login", adminController.loginverification);

// for dashboard
router.get("/", adminAuth, sessionCheck, adminController.loaddashboard);

//for logout
router.get("/logout", adminController.logout);

//for user list page
router.get("/users", sessionCheck, adminAuth, customerController.userInfo);
//for blocking user
router.get("/block-user", adminAuth, customerController.userBlocked);
router.get("/unblock-user", adminAuth, customerController.userUnblocked);

//for category list page
router.get("/category", adminAuth, sessionCheck, catController.categoryInfo);
router.post("/addCategory", adminAuth, sessionCheck, catController.addCategory);

module.exports = router;
