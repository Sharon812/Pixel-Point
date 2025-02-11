const User = require("../../models/userSchema");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const env = require("dotenv").config();
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Address = require("../../models/addressSchema");
const Product = require("../../models/productSchema");
const Cart = require("../../models/cartSchema");
const Brand = require("../../models/brandSchema");
const Category = require("../../models/categorySchema");
const Order = require("../../models/orderSchema");
const Wallet = require("../../models/walletSchema");
const Coupons = require("../../models/couponSchema");

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

        item.comboDetails = combo;
      }
    }

    const address = addresses.flatMap((doc) => doc.address);
    const validCartItems = cart.items.filter((item) => item.quantity > 0);

    for (const item of validCartItems) {
      const availableQuantity = item.comboDetails
        ? item.comboDetails.quantity
        : item.productId.stock;
    }
    const totalPrice = validCartItems.reduce(
      (sum, item) =>
        sum +
        (item.comboDetails ? item.comboDetails.salePrice : item.price) *
          item.quantity,
      0
    );

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
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

//for placing order
const placeOrder = async (req, res) => {
  try {
    const userId = req.session.user;
    const { selectedAddress, paymentMethod, couponCode, discount } = req.body;
    console.log(req.body, "redfjo");

    if (!selectedAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Missing order details",
      });
    }

    const cart = await Cart.findOne({ userId })
      .populate({
        path: "items.productId",
        populate: { path: "combos", model: "Combo" },
      })
      .lean();
    const cartItemLength = cart.items.length;
    let discountPerProduct = 0;
    if (discount !== null) {
      discountPerProduct = Math.round(discount / cartItemLength);
    }
    if (!cart?.items?.length) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

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
          dicountPrice: discountPerProduct,
          finalAmount:
            item.quantity * selectedCombo.salePrice - discountPerProduct,
          RAM: selectedCombo.ram,
          Storage: selectedCombo.storage,
          color: selectedCombo.color[0],
          status: "Pending",
        };
      })
    );

    const totalAmount = orderItems.reduce(
      (acc, item) => acc + item.totalPrice,
      0
    );

    const finalAmount = req.body.discountedTotal || totalAmount;

    const newOrder = new Order({
      userId: userId,
      address: selectedAddress,
      paymentMethod,
      orderedItems: orderItems,
      totalPrice: totalAmount,
      discount: discount,
      FinalAmount: finalAmount,
      couponCode: couponCode || null,
      paymentStatus:
        paymentMethod === "Cash on Delivery" ? "Confirmed" : "Pending Payment",
    });
    await newOrder.save();

    if (paymentMethod === "Cash on Delivery") {
      await updateInventory(orderItems, userId);
      await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });
      if (discount > 0) {
        const couponData = await Coupons.findOne({ name: couponCode });
        couponData.usesCount += 1;
        await couponData.save();
      }
      return res.json({
        success: true,
        message: "COD order placed successfully",
        order: newOrder,
      });
    }

    if (paymentMethod === "wallet") {
      const wallet = await Wallet.findOne({ user: userId });
      if (!wallet) {
        return res
          .status(400)
          .json({ success: false, message: "Insufficient Amount in wallet" });
      }

      if (wallet.balance < finalAmount) {
        return res
          .status(400)
          .json({ success: false, message: "Insufficient Balance" });
      }
      wallet.balance = wallet.balance - finalAmount;
      wallet.transactions.push({
        type: "debit",
        amount: finalAmount,
        date: new Date(),
        description: `${finalAmount} debited for purchasing `,
      });
      await wallet.save();
      if (discount > 0) {
        const couponData = await Coupons.findOne({ name: couponCode });
        couponData.usesCount += 1;
        await couponData.save();
      }
      await updateInventory(orderItems, userId);

      return res.status(200).json({ success: true, message: "Order Placed" });
    }
    console.log(finalAmount, "finalamount");
    if (paymentMethod === "razorpay") {
      console.log("hey");
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(finalAmount * 100),
        currency: "INR",
        receipt: newOrder._id.toString(),
        payment_capture: 1,
      });
      console.log(razorpayOrder, "raxor");
      if (discount > 0) {
        console.log("under");
        const couponData = await Coupons.findOne({ name: couponCode });
        couponData.usesCount += 1;
        await couponData.save();
      }

      return res.json({
        success: true,
        message: "Razorpay order created",
        razorpayOrder: razorpayOrder,
        order: newOrder,
        finalAmount: finalAmount,
      });
    }

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

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const order = await Order.findById(order_id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      order.paymentStatus = "Confirmed";
      await order.save();
      await Cart.findOneAndUpdate(
        { userId: order.userId },
        { $set: { items: [] } }
      );
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
  } catch (error) {
    console.log(error, "errror at rendering order placed page");
    res.redirect("/page-not-found");
  }
};

module.exports = {
  processCheckout,
  placeOrder,
  orderPlaced,
  verifyPayment,
};
