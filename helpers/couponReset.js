const Coupon = require("../models/couponSchema");

const checkIfCouponExpired = async () => {
    try {
        const now = new Date();

        const expiredCoupons = await Coupon.find({ expireOn: { $lte: now }, isListed: true });

        for (const coupon of expiredCoupons) {
            try {
                coupon.isListed = false;
                await coupon.save(); 
                console.log(`Coupon "${coupon.name}" has expired and is now inactive.`);
            } catch (err) {
                console.error(`Error updating coupon "${coupon.name}":`, err);
            }
        }

        if (expiredCoupons.length === 0) {
            console.log("No expired coupons found.");
        }
    } catch (error) {
        console.error("Error checking expired coupons:", error);
    }
};

module.exports = checkIfCouponExpired;
