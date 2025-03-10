const Coupon = require("../../models/couponSchema");

const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ isDeleted: false }).sort({
      createdOn: 1,
    });
    res.render("coupons", {
      coupons: coupons,
      currentPage:"coupons"

    });
  } catch (error) {
    console.log("error at coupons", error);
  }
};

const addCoupon = async (req, res) => {
  try {
    const {
      name,
      expireOn,
      offerPrice,
      minimumPrice,
      maxUses,
      startOn,
      maxUsesPerUser,
    } = req.body;
    if (!name || !expireOn || !offerPrice || !minimumPrice) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    if (parseFloat(offerPrice) >= parseFloat(minimumPrice)) {
      return res.status(400).json({
        success: false,
        error: "Offer amount must be less than minimum purchase amount",
      });
    }
    const startDate = new Date(startOn);
    const expiryDate = new Date(expireOn);
    if (expiryDate <= startDate) {
      return res.status(400).json({
        success: false,
        error: "Expiry date must be in the future",
      });
    }

    // Check for existing coupon
    const existingCoupon = await Coupon.findOne({
      name: name.toUpperCase(),
      isDeleted: false,
    });

    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        error: "Coupon code already exists",
      });
    }

    // Create new coupon
    const newCoupon = new Coupon({
      name: name.toUpperCase(),
      startOn: startDate,
      expireOn: expiryDate,
      offerPrice: parseFloat(offerPrice),
      minimumPrice: parseFloat(minimumPrice),
      maxUses: parseInt(maxUses) || 100,
      maxUsesPerUser: parseInt(maxUsesPerUser) || 1,
    });

    await newCoupon.save();
    res.json({ success: true });
  } catch (error) {
    console.error("Add Coupon Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};

const updateCouponStatus = async (req, res) => {
  try {
    const { couponId } = req.params;
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      couponId,
      { $set: { isListed: !coupon.isListed } },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "Coupon updated", coupon: updatedCoupon });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      couponId,
      { $set: { isDeleted: !coupon.isDeleted } },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "Coupon updated", coupon: updatedCoupon });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getCoupons, addCoupon, updateCouponStatus, deleteCoupon };
