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
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY, // Store in .env
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

//for rendering wallet
const getWallet = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6; // Items per page

    const userId = req.user ? req.user.id : null;
    const userData = await User.findById(userId);
    let walletData = await Wallet.findOne({ user: userId });

    let paginatedTransactions = [];
    let totalPages = 0;

    if (walletData && walletData.transactions.length > 0) {
      walletData.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      totalPages = Math.ceil(walletData.transactions.length / limit);
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      paginatedTransactions = walletData.transactions.slice(startIndex, endIndex);
    }

    res.render("wallet", {
      walletData: {
        balance: walletData ? walletData.balance : 0,
        transactions: paginatedTransactions
      },
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      user: userData,
    });
  } catch (error) {
    console.log(error, "error at rendering wallet page");
    res.redirect("/page404");
  }
};

//for adding money to wallet
const addMoneyToWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.session.user;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    });

    console.log(order);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error.message);
    res.redirect("/page404");
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      amount,
    } = req.body;
    const user = req.session.user;
    const userId = req.session.user;

    // Generate signature using Razorpay's algorithm
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(body.toString())
      .digest("hex");

    // Compare signatures
    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }

    // Payment is verified, update wallet balance
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      // Create wallet if it doesn't exist
      wallet = await Wallet.create({
        user: userId,
        balance: amount,
        transactions: [
          {
            type: "credit",
            amount: amount,
            date: new Date(), // Save the current date and time
            description: "Money added to wallet",
          },
        ],
      });
    } else {
      // Update balance
      wallet.balance += amount;
      wallet.transactions.push({
        type: "credit",
        amount: amount,
        date: new Date(), // Save the current date and time
        description: "Money added to wallet",
      });
      await wallet.save();
    }

    res.status(200).json({
      success: true,
      message: "Payment verified and wallet updated",
      wallet,
    });
  } catch (error) {
    console.error("Error verifying payment:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getWallet,
  addMoneyToWallet,
  verifyPayment,
};
