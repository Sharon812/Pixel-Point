const Coupon = require("../../models/couponSchema");

//function to get available cooupons
const getAvailableCoupons = async (req, res) => {
  try {
    let currentDate = new Date();
    currentDate = currentDate.toISOString().replace("Z", "+00:00");
    const coupons = await Coupon.find({
      isDeleted: false,
      isListed: true,
      $expr: { $lte: ["$usesCount", "$maxUses"] },
      startOn:{ $lte:currentDate},
      expireOn: { $gte: currentDate },
    }); 


    res.json(coupons);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
};

//function to apply coupons
const applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    let currentDate = new Date();
    currentDate = currentDate.toISOString().replace("Z", "+00:00");
    const coupon = await Coupon.findOne({
      name: code,
      isListed: true,
      isDeleted: false,
      $expr: { $lte: ["$usesCount", "$maxUses"] },
      startOn:{ $lte:currentDate},
      expireOn: { $gte: currentDate},
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
  applyCoupon,
};
