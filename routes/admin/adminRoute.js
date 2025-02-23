const express = require("express");
const router = express.Router();
const adminController = require("../../controller/admin/adminController");
const customerController = require("../../controller/admin/customerController");
const sessionCheck = require("../../middlewares/adminSessionAuth");
const catController = require("../../controller/admin/categoryController");
const productCont = require("../../controller/admin/productController");
const brandController = require("../../controller/admin/brandController");
const orderController = require("../../controller/admin/orderController");
const couponController = require("../../controller/admin/coupounController");
//for multer//not
const multer = require("multer");
const storage = require("../../helpers/multer");
const uploads = multer({ storage: storage });

// for login page
router.get("/login", adminController.loadlogin);
router.post("/login", adminController.loginverification);

// for dashboard
router.get("/", adminController.loaddashboard);

//for logout
router.get("/logout", adminController.logout);

//for user list page
router.get("/users", customerController.userInfo);
//for blocking user
router.get("/block-user", customerController.userBlocked);
router.get("/unblock-user", customerController.userUnblocked);

//for category list page
router.get("/category", catController.categoryInfo);
router.post("/addCategory", catController.addCategory);
router.get("/deleteCategory", catController.deleteCategory);
router.get("/editCategory", catController.geteditCategory);
router.post("/editCategory/:id", catController.editCategory);

//for product list page
router.get("/addProducts", productCont.getProductInfo);
router.post(
  "/addProducts",
  sessionCheck,
  uploads.array("images", 4),
  productCont.addProducts
);
router.get("/products", productCont.getAllProducts);
router.put("/products/deleteProduct", productCont.deleteProducts);
router.get("/editProduct", productCont.getEditProducts);
router.post(
  "/editProduct/:id",
  uploads.array("images", 4),
  productCont.editProduct
);
router.post("/deleteimage", productCont.deleteSingleImage);
router.patch("/add-product-offer", productCont.addOffer);
router.patch("/remove-product-offer", productCont.removeOffer);

//for brands section
router.get("/brands", brandController.getBrandPage);
router.post("/addbrands", uploads.single("image"), brandController.addBrand);
router.patch("/blockBrand", brandController.blockBrand);
router.patch("/unblockBrand", brandController.unblockBrand);

//for orders
router.get("/orders", orderController.getOrderDetails);
router.post("/orders/update-status", orderController.updateStatus);
router.patch("/confirm-returnorder", orderController.confirmReturnOrder);
router.patch("/deny-returnorder", orderController.denyReturnOrder);
router.get("/view-order-details",orderController.getFullOrderDetails)

// Sales Report Routes
router.get("/sales-report/daily", adminController.generateDailyReport);
router.get("/sales-report/weekly", adminController.generateWeeklyReport);
router.get("/sales-report/yearly", adminController.generateYearlyReport);
router.get("/sales-report/custom", adminController.generateCustomReport);

// Chart Data Route
router.get("/chart-data/:filter", adminController.getFilteredChartData);

//for coupons
router.get("/coupons", couponController.getCoupons);
router.post("/addcoupons", couponController.addCoupon);
router.patch(
  "/update-coupon-status/:couponId",
  couponController.updateCouponStatus
);
router.patch("/delete-coupon/:couponId", couponController.deleteCoupon);

//for category offer
router.patch("/add-category-offer", catController.addCateogoryOffer);
router.patch("/remove-offer", catController.removeOffer);

module.exports = router;
