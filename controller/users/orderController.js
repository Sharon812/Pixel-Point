const User = require("../../models/userSchema");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const env = require("dotenv").config();
const bycrypt = require("bcrypt");
const crypto = require("crypto");
const Address = require("../../models/addressSchema");
const Product = require("../../models/productSchema");
const Cart = require("../../models/cartSchema");
const Brand = require("../../models/brandSchema");
const Category = require("../../models/categorySchema");

const processCheckout = async (req, res) => {
  try {
    const userId = req.session.user;
    const userData = userId ? await User.findById(userId) : null;
    console.log(userId, "userdi");
    // Fetch the required data
    const brand = await Brand.find({});
    const addresses = await Address.find({ userId: userId });
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      return res.status(404).render("cart", { message: "Cart is empty" });
    }

    // Fetch combo details manually
    for (const item of cart.items) {
      if (item.comboId) {
        const product = await Product.findById(item.productId);
        const combo = product.combos.find(
          (combo) => combo._id.toString() === item.comboId.toString()
        );

        if (!combo) {
          return res.status(400).render("cart", {
            message: `Combo not found for product ${product.productName}`,
          });
        }

        // Attach combo details to the item
        item.comboDetails = combo;
      }
    }
    console.log(addresses, "addresses");
    // Filter out items with zero quantity
    const validCartItems = cart.items.filter((item) => item.quantity > 0);

    // Calculate the cart item count
    const cartItemCount = validCartItems.filter(
      (item) => !item.outOfStock
    ).length;

    // Calculate total price
    const totalPrice = validCartItems.reduce(
      (sum, item) =>
        sum +
        (item.comboDetails ? item.comboDetails.salePrice : item.price) *
          item.quantity,
      0
    );

    // Check stock for each valid item
    for (const item of validCartItems) {
      const availableQuantity = item.comboDetails
        ? item.comboDetails.quantity
        : item.productId.stock;

      if (availableQuantity < item.quantity) {
        return res.status(400).render("cart", {
          message: `The product ${item.productId.productName} is out of stock or has insufficient quantity.`,
        });
      }
    }

    // Calculate the cart summary
    const cartSummary = {
      totalItems: cartItemCount,
      totalPrice,
    };

    const defaultAddress = addresses[0].address[0]; // Extract the first address
    // const otherAddresses = addresses.address.slice(1); // Remaining addresses
    // console.log(otherAddresses, "defgai");
    // Pass data to the view
    res.render("checkOut", {
      addresses,
      cart: { items: validCartItems },
      brand,
      cartItemCount,
      cartSummary,
      user: userData,
      totalPrice,
      defaultAddress,
    });
  } catch (error) {
    console.error("Error processing checkout:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  processCheckout,
};
