const express = require("express");
const router = express.Router();
const adminController = require("../../controller/admin/adminController");

//function for login page
router.get("/login", adminController.loadlogin);
router.post("/login", adminController.loginverification);

//function for dashboard
router.get("/dashboard", adminController.loaddashboard);

module.exports = router;
