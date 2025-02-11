const User = require("../../models/userSchema");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const env = require("dotenv").config();
const bycrypt = require("bcrypt");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Address = require("../../models/addressSchema");
const Product = require("../../models/productSchema");
const Cart = require("../../models/cartSchema");
const Brand = require("../../models/brandSchema");
const Category = require("../../models/categorySchema");
const Order = require("../../models/orderSchema");

const processCheckout = async (req, res) => {
  try {
    const userId = req.session.user;
    const userData = userId ? await User.findById(userId) : null;
    const brand = await Brand.find({});
    const addresses = await Address.find({ userId: userId });
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      return res
        .status(404)
        .json({ sucess: false, message: "no cart available" });
    }

    // Fetch combo details manually
    for (const item of cart.items) {
      if (item.comboId) {
        const product = await Product.findById(item.productId);
        const combo = product.combos.find(
          (combo) => combo._id.toString() === item.comboId.toString()
        );

        if (!combo) {
          return res
            .status(404)
            .json({ sucess: false, message: "combos not available" });
        }

        // Attach combo details to the item
        item.comboDetails = combo;
      }
    }

    const address = addresses.flatMap((doc) => doc.address);
    // Filter out items with zero quantity
    const validCartItems = cart.items.filter((item) => item.quantity > 0);

    // Check stock for each valid item
    for (const item of validCartItems) {
      const availableQuantity = item.comboDetails
        ? item.comboDetails.quantity
        : item.productId.stock;
    }
    // Calculate total price
    const totalPrice = validCartItems.reduce(
      (sum, item) =>
        sum +
        (item.comboDetails ? item.comboDetails.salePrice : item.price) *
          item.quantity,
      0
    );

    // Calculate the cart summary
    const cartSummary = {
      totalPrice,
    };

    res.render("checkOut", {
      cart: { items: validCartItems },
      brand,
      cartSummary,
      user: userData,
      totalPrice,
      address,
    });
  } catch (error) {
    console.error("Error processing checkout:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY, // Store in .env
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

const placeOrder = async (req, res) => {
  try {
    const userId = req.session.user;
    const { selectedAddress, paymentMethod } = req.body;

    // Validate input
    if (!selectedAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Missing order details",
      });
    }
    console.log(paymentMethod, "paymentmethod");

    // Get cart items
    const cart = await Cart.findOne({ userId })
      .populate({
        path: "items.productId",
        populate: { path: "combos", model: "Combo" },
      })
      .lean();

    // Validate cart
    if (!cart?.items?.length) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Process order items
    const orderItems = await Promise.all(
      cart.items.map(async (item) => {
        const selectedCombo = item.productId.combos.find(
          (combo) => combo._id.toString() === item.comboId.toString()
        );

        if (!selectedCombo) {
          throw new Error(
            `Combo not found for product: ${item.productId.productName}`
          );
        }

        return {
          product: item.productId._id,
          productName: item.productId.productName,
          quantity: item.quantity,
          price: selectedCombo.salePrice,
          totalPrice: item.quantity * selectedCombo.salePrice,
          RAM: selectedCombo.ram,
          Storage: selectedCombo.storage,
          color: selectedCombo.color[0],
          status: "Pending",
        };
      })
    );

    // Calculate totals
    const totalAmount = orderItems.reduce(
      (acc, item) => acc + item.totalPrice,
      0
    );

    const finalAmount = req.body.discountedTotal || totalAmount;
    const discount = totalAmount - finalAmount;

    // Create order document
    const newOrder = new Order({
      userId: userId,
      address: selectedAddress,
      paymentMethod,
      orderedItems: orderItems,
      totalPrice: totalAmount,
      discount: discount,
      FinalAmount: finalAmount,
      paymentStatus:
        paymentMethod === "Cash on Delivery" ? "Confirmed" : "Pending Payment",
    });
    console.log(newOrder, "neworder");
    await newOrder.save();

    // Handle COD immediately
    if (paymentMethod === "Cash on Delivery") {
      await updateInventory(orderItems, userId);
      // Clear user's cart after successful order
      await Cart.findOneAndUpdate(
        { userId },
        { $set: { items: [] } }
      );
      return res.json({
        success: true,
        message: "COD order placed successfully",
        order: newOrder,
      });
    }

    // Handle Razorpay payment
    if (paymentMethod === "razorpay") {
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(finalAmount * 100), // Convert to paise and ensure it's rounded
        currency: "INR",
        receipt: newOrder._id.toString(),
        payment_capture: 1,
      });
      console.log(razorpayOrder, "razorpayorder");

      return res.json({
        success: true,
        message: "Razorpay order created",
        razorpayOrder: razorpayOrder,
        order: newOrder,
        finalAmount: finalAmount
      });
    }

    // Handle invalid payment method
    return res.status(400).json({
      success: false,
      message: "Invalid payment method",
    });
  } catch (error) {
    console.error("Order placement error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Order placement failed",
    });
  }
};

// Separate inventory update function
const updateInventory = async (orderItems, userId) => {
  await Promise.all(
    orderItems.map(async (item) => {
      const product = await Product.findById(item.product);
      const comboIndex = product.combos.findIndex(
        (combo) =>
          combo.ram === item.RAM &&
          combo.storage === item.Storage &&
          combo.color.includes(item.color)
      );

      if (comboIndex === -1) throw new Error("Combo not found");

      if (product.combos[comboIndex].quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.productName}`);
      }

      product.combos[comboIndex].quantity -= item.quantity;
      if (product.combos[comboIndex].quantity === 0) {
        product.combos[comboIndex].status = "Out of Stock";
      }

      await product.save();

      await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });
    })
  );
};

// Razorpay payment verification endpoint
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
    } = req.body;

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Update order status
      const order = await Order.findById(order_id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Update order payment status
      order.paymentStatus = "Confirmed";
      await order.save();

      // Clear user's cart after successful payment
      await Cart.findOneAndUpdate(
        { userId: order.userId },
        { $set: { items: [] } }
      );

      // Update inventory
      await updateInventory(order.orderedItems, order.userId);

      return res.json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying payment",
    });
  }
};

const orderPlaced = async (req, res) => {
  try {
    res.render("orderPlaced");
  } catch (error) {}
};

module.exports = {
  processCheckout,
  placeOrder,
  orderPlaced,
  verifyPayment,
};
