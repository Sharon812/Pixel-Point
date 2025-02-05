const Coupon = require("../../models/couponSchema");

const getAvailableCoupons = async (req, res) => {
  try {
    let currentDate = new Date();
    currentDate = currentDate.toISOString().replace("Z", "+00:00");
    console.log(currentDate);

    const coupons = await Coupon.find({
      isDeleted: false,
      startOn: { $lte: currentDate },
      expireOn: { $gt: currentDate },
    });
    console.log(currentDate);
    console.log(coupons, "coupons");
    res.json(coupons);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
};

const applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const userId = req.session.user;

    const coupon = await Coupon.findOne({
      name: code,
      isListed: true,
      isDeleted: false,
      expireOn: { $gt: new Date() },
    });

    if (!coupon) {
      return res.json({
        status: "error",
        message: "Invalid or expired coupon code",
      });
    }

    if (cartTotal < coupon.minimumPrice) {
      return res.json({
        status: "error",
        message: `Minimum purchase of ₹${coupon.minimumPrice} required`,
      });
    }

    if (coupon.usesCount >= coupon.maxUses) {
      return res.json({
        status: "error",
        message: "Coupon usage limit reached",
      });
    }

    res.json({
      status: "success",
      discount: coupon.offerPrice,
      message: "Coupon applied successfully!",
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to validate coupon",
    });
  }
};

module.exports = {
  getAvailableCoupons,
  applyCoupon
};
