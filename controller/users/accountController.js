const User = require("../../models/userSchema");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const env = require("dotenv").config();
const bycrypt = require("bcrypt");
const crypto = require("crypto");
const Address = require("../../models/addressSchema");
const Cart = require("../../models/cartSchema");
const Order = require("../../models/orderSchema");
const Wallet = require("../../models/walletSchema");
const Product = require("../../models/productSchema");

//for forgot password
const getForgotPassword = async (req, res) => {
  try {
    res.render("forgotPassword");
  } catch (error) {
    console.log("error getting forgotpassword page", error);
    res.redirect("/page-not-found");
  }
};

//function to generate otp
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

//function to send email
async function sendVerificationEmail(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: "Verify your account",
      text: `Your otp is ${otp}`,
      html: `<b> Your otp is ${otp}</b>`,
    });

    return info.accepted.length > 0;
  } catch (error) {
    console.log("error sending email", error);
    return false;
  }
}

const forgotPasswordOtp = async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const user = await User.findOne({
    email: email,
    password: { $exists: true, $ne: null },
  });
  try {
    if (!user) {
      return res.render("forgotPassword", { message: "User Does not exist" });
    }

    const otp = generateOtp();

    const emailSent = sendVerificationEmail(email, otp);

    if (!emailSent) {
      return res.render("forgotPassword", { message: "Unable to sent email" });
    }
    req.session.userOtp = otp;
    req.session.email = email;

    res.render("forgotPasswordVerification");
  } catch (error) {
    console.log(error, "error forgot password otp rendering");
    return res.redirect("/page-not-found");
  }
};

const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    if (otp !== req.session.userOtp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    const user = await User.findOne({ email: req.session.email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetToken = hashedToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour

    await user.save();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    const resetLink = `https://pixelpoint.sharonp.tech/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click the link below to reset your password:</p>
             <a href="${resetLink}">Reset Password</a>
             <p>This link is valid for 1 hour.</p>`,
    });

    res.json({
      success: true,
      message: "Password reset link sent to your email",
      redirectUrl: "/login",
    });
  } catch (error) {
    console.error("Error verifying forgot password OTP:", error);
    res.status(500).json({ success: false, message: "Server error occurred" });
  }
};

//for getting reset password
const getResetPassword = async (req, res) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send("Invalid or expired token");
    }

    res.render("resetPassword", {
      token: token,
    });
  } catch (error) {
    console.log(error, "error at getting reset password");
  }
};

//for changing password
const resetPassword = async (req, res) => {
  const { token } = req.params;
  try {
    const { password } = req.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find the user by token and check if the token is still valid
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json("Invalid or expired token");
    }

    // Hash the new password
    const hashedPassword = await bycrypt.hash(password, 10);

    // Update the user's password and clear the reset token
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ success: true, redirectUrl: "/login" });
  } catch (error) {
    res.status(500).json("Something went wrong");
  }
};

//for account details
const getAccountDetails = async (req, res) => {
  try {
    const user = req.session.user;
    if (user) {
      const userData = await User.findById({ _id: user }).lean();
      return res.render("accountDetails", {
        user: userData,
      });
    }
  } catch (error) {
    console.log("error at getting account details", error);
    res.redirect("/page-not-found");
  }
};

//for updating account details
const updateAccountDetails = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const id = req.params.id;
    const user = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          name: name,
          phone: phone,
          email: email,
        },
      },
      { new: true } // Return the updated document
    );
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User updating failed" });
    }

    return res
      .status(200)
      .json({ success: true, message: "user updated successfully" });
  } catch (error) {
    console.log("Error at updating account details", error);
    return res.status(500).json({ success: false, message: "server error" });
  }
};

//for showing address details
const getAddress = async (req, res) => {
  try {
    const user = req.session.user;
    const userData = await User.findById({ _id: user }).lean();
    const addressData = await Address.find({ userId: user });
    return res.render("addressDetails", {
      user: userData,
      addresses: addressData,
    });
  } catch (error) {
    console.log("error at getting address details", error);
    res.redirect("/page-not-found");
  }
};

//for showing add address page
const getAddAddress = async (req, res) => {
  try {
    const user = req.session.user;
    const userData = await User.findById({ _id: user }).lean();
    return res.render("addAddress", {
      user: userData,
    });
  } catch (error) {
    console.log(error);
    return res.redirect("/page-not-found");
  }
};
//for adding aaddress
const addAddress = async (req, res) => {
  try {
    const user = req.session.user;
    const { type, houseName, city, landmark, state, pincode, phone, altPhone } =
      req.body;

    const userData = await User.findById(user).lean();
    if (!userData) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const existingAddress = await Address.findOne({ userId: user });

    if (existingAddress) {
      existingAddress.address.push({
        addressType: type,
        name: houseName,
        city: city,
        landMark: landmark,
        state: state,
        pincode: pincode,
        phone: phone,
        alternatePhone: altPhone,
      });
      await existingAddress.save();
      return res
        .status(200)
        .json({ success: true, message: "Address added successfully" });
    } else {
      const newAddress = new Address({
        userId: userData._id,
        address: [
          {
            addressType: type,
            name: houseName,
            city: city,
            landMark: landmark,
            state: state,
            pincode: pincode,
            phone: phone,
            alternatePhone: altPhone,
          },
        ],
      });
      await newAddress.save();
      return res
        .status(200)
        .json({ success: true, message: "Address added successfully" });
    }
  } catch (error) {
    console.log(error, "Error at adding address");
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const getEditAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.session.user;
    const userData = await User.findById({ _id: user });
    const addressData = await Address.findOne(
      { userId: user, "address._id": id },
      { "address.$": 1 }
    );
    if (!addressData) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }
    return res.render("editAddress", {
      addressData: addressData.address[0],
      user: userData,
    });
  } catch (error) {
    console.log("error rendering edit address page", error);
    res.redirect("/page-not-found");
  }
};

const editAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.session.user;
    const { type, houseName, city, landmark, state, pincode, phone, altPhone } =
      req.body;
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access" });
    }
    const addressUpdateResult = await Address.updateOne(
      { userId: user, "address._id": id },
      {
        $set: {
          "address.$.addressType": type,
          "address.$.name": houseName,
          "address.$.city": city,
          "address.$.landmark": landmark,
          "address.$.state": state,
          "address.$.pincode": pincode,
          "address.$.phone": phone,
          "address.$.alternatePhone": altPhone,
        },
      }
    );
    if (addressUpdateResult.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    if (addressUpdateResult.modifiedCount === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No changes made to the address" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Address updated successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to edit address" });
  }
};

//for deleting address
const deleteAddress = async (req, res) => {
  try {
    const userId = req.session.user;
    const { id } = req.params;
    const updatedAddress = await Address.findOneAndUpdate(
      { userId },
      { $pull: { address: { _id: id } } },
      { new: true }
    );
    if (!updatedAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found or user unauthorized",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to delete address" });
  }
};

//function to render orders in account details page

const getOrders = async (req, res) => {
  try {
    const user = req.session.user;
    const userData = await User.findById(user);

    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments({ userId: user });
    const totalPages = Math.ceil(totalOrders / limit);

    const orders = await Order.find({ userId: user })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("orderedItems.product");

    res.render("orderDetails", {
      user: userData,
      orders: orders,
      currentPage: page,
      totalPages: totalPages,
    });
  } catch (error) {
    console.log(
      error,
      "error at getting order details at accountcontroller.js"
    );
    res.redirect("/page-not-found");
  }
};

//function to render order details of specific order
const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.query;

    const user = req.session.user;
    const userData = await User.findById(user);
    const orders = await Order.find({ userId: user }).populate(
      "orderedItems.product"
    );

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order details not found",
      });
    }

    const orderWithItem = orders.find((order) =>
      order.orderedItems.some((item) => item._id.toString() === orderId)
    );

    if (!orderWithItem) {
      return res.status(404).json({
        success: false,
        message: "Order item not found",
      });
    }

    const orderDetails = orderWithItem.orderedItems.filter(
      (item) => item._id.toString() === orderId
    );

    const addressDocuments = await Address.find({ userId: user });

    const specificAddress = addressDocuments
      .flatMap((doc) => doc.address) // Combine all address arrays
      .find((addr) => addr._id.toString() === orderWithItem.address.toString());

    res.render("viewOrder", {
      orderDetails: orderDetails,
      orderData: orderWithItem,
      user: userData,
      address: specificAddress,
    });
  } catch (error) {
    console.log(error, "error at order details");
    res.redirect("/page-not-found");
  }
};

//function to cancel order
const cancelOrder = async (req, res) => {
  try {
    const { itemId, orderId, reason } = req.body;
    const order = await Order.findOne({
      _id: orderId,
      "orderedItems._id": itemId,
    });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order or item not found" });
    }
    let refundAmount = 0;
    let orderItem = order.orderedItems.find(
      (item) => item._id.toString() === itemId
    );
    if (!orderItem) {
      return res
        .status(400)
        .json({ success: false, message: "Item not found in order" });
    }
    orderItem = Array.isArray(orderItem) ? orderItem : [orderItem];

    await Promise.all(
      orderItem.map(async (item) => {
        const product = await Product.findById(item.product).populate("brand").populate("category")
  
      const brand = product.brand;
      const category = product.category; 

        const comboIndex = product.combos.findIndex(
          (combo) =>
            combo.ram === item.RAM &&
            combo.storage === item.Storage &&
            combo.color.includes(item.color)
        );

      brand.soldCount = brand.soldCount || 0;
      category.soldCount = category.soldCount || 0;
      product.combos[comboIndex].soldCount -= item.quantity;
      brand.soldCount -= item.quantity;
      category.soldCount -= item.quantity;
        product.combos[comboIndex].quantity += item.quantity;
        if (product.combos[comboIndex].quantity > 0) {
          product.combos[comboIndex].status = "Available";
        }

        await Promise.all([brand.save(), category.save(), product.save()]);
      })
    );

    if (
      order.paymentMethod === "razorpay" ||
      order.paymentMethod === "wallet"
    ) {
      refundAmount = orderItem[0].finalAmount;
      let wallet = await Wallet.findOne({ user: order.userId });

      if (!wallet) {
        wallet = new Wallet({
          user: order.userId,
          balance: refundAmount,
          transactions: [],
        });
      } else {
        wallet.balance += refundAmount;
      }

      wallet.transactions.push({
        type: "credit",
        amount: refundAmount,
        date: new Date(),
        description: `Refund of product ${orderItem[0].productName}`,
      });

      await wallet.save();
    }

    orderItem[0].status = "Cancelled";
    orderItem[0].cancellationReason = reason;
    await order.save();

    return res
      .status(200)
      .json({ success: true, message: "Order item cancelled successfully" });
  } catch (error) {
    console.error(error, "error at cancelling order");
    return res.status(500).json({ message: "Internal server error" });
  }
};

//function to return order in user side
const returnOrder = async (req, res) => {
  try {
    const { itemId, orderId, reason } = req.body;

    
    const order = await Order.findOne({ _id: orderId, "orderedItems._id": itemId });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order or item not found" });
    }
    const orderedItem = order.orderedItems.find(item => item._id.toString() === itemId);

    if (!orderedItem) {
      return res.status(404).json({ success: false, message: "Ordered item not found" });
    }

    const deliveredAt = new Date(orderedItem.delivered_at);
    const sevenDaysLater = new Date(deliveredAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    if (new Date() > sevenDaysLater) {
      return res.status(400).json({ success: false, message: "Return period expired. You can only return within 7 days after delivery." });
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId, "orderedItems._id": itemId },
      {
        $set: {
          "orderedItems.$.status": "Return Requested",
          "orderedItems.$.cancellationReason": reason,
        },
      },
      { new: true }
    );
    return res
      .status(200)
      .json({ success: true, message: "Order item cancelled successfully" });
  } catch (error) {
    console.error(error, "error at cancelling order");
    return res.status(500).json({ message: "Internal server error" });
  }
};

//function to render refferal page
const getReferallPage = async (req, res) => {
  try {
    const user = req.session.user
    const userData = await User.findById(user)
    .populate("refferalUsers.userId");

    const refferalAmountPerUser = 500

    const refferedUsersCount = userData.refferalUsers.length
    const totalRefferalAmount = userData.refferalUsers.length * refferalAmountPerUser


    res.render("referallPage",{
      user:userData,
      refferedUsersCount,
      totalRefferalAmount
    });
  } catch (error) {
    console.log(error, "error at loading referal page in user side");
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  getForgotPassword,
  forgotPasswordOtp,
  verifyForgotPasswordOtp,
  getResetPassword,
  resetPassword,
  getAccountDetails,
  updateAccountDetails,
  getAddress,
  addAddress,
  getAddAddress,
  getEditAddress,
  editAddress,
  deleteAddress,
  getOrders,
  getOrderDetails,
  cancelOrder,
  returnOrder,
  getReferallPage,
};
