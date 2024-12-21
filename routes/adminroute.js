const express = require("express");
const adminRoute = express.Router();

const adminController = require("../Controller/admin/adminController");

adminRoute.get("/dashboard", adminController.loadAdminDashboard);

module.exports = adminRoute;
