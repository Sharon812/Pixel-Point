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

placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { selectedAddress, paymentMethod } = req.body;

    if (!selectedAddress || !paymentMethod) {
      return res
        .status(400)
        .json({ success: false, message: "Missing order details" });
    }

    const cart = await Cart.findOne({ userId }).populate("items.ProductId");
    console.log(cart, "cart placeorder");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Filter out items with zero quantity for the order
    const validCartItems = cart.items.filter((item) => item.quantity > 0);

    if (validCartItems.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No valid items in cart" });
    }

    const orderItems = validCartItems.map((item) => ({
      product: item.ProductId._id,
      productName: item.ProductId.productName, // Add product name
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.totalPrice,
      RAM: item.RAM,
      Storage: item.Storage,
      color: item.color,
      status: "Pending",
    }));

    console.log(orderItems);

    const totalAmount = validCartItems.reduce(
      (acc, item) => acc + item.totalPrice,
      0
    );

    // Create the order
    const newOrder = new Order({
      userId,
      address: selectedAddress,
      paymentMethod,
      orderedItems: orderItems,
      totalPrice: totalAmount,
      FinalAmount: totalAmount,
      status: "Pending",
    });

    await newOrder.save();

    // Update the product quantities in the Product collection
    for (const item of validCartItems) {
      const product = await Product.findById(item.ProductId._id);

      if (product) {
        const comboIndex = product.combos.findIndex(
          (combo) =>
            combo.ram === item.RAM &&
            combo.storage === item.Storage &&
            combo.color.includes(item.color)
        );

        if (comboIndex !== -1) {
          const selectedCombo = product.combos[comboIndex];

          // Check if there is enough stock
          if (selectedCombo.quantity < item.quantity) {
            return res.status(400).json({
              success: false,
              message: `Insufficient stock for product: ${product.productName}, RAM: ${item.RAM}, Storage: ${item.Storage}`,
            });
          }

          // Reduce the quantity
          product.combos[comboIndex].quantity -= item.quantity;

          // Update the status if the stock is 0
          if (product.combos[comboIndex].quantity === 0) {
            product.combos[comboIndex].status = "Out of Stock";
          }

          await product.save();
        } else {
          return res.status(400).json({
            success: false,
            message: `Invalid combo selection for product: ${product.productName}`,
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: `Product not found for ID: ${item.ProductId._id}`,
        });
      }
    }

    // Remove only the valid items from the cart after placing the order
    cart.items = cart.items.filter((item) => item.quantity === 0);
    await cart.save();

    // Render the order successful page with order details
    res.render("user/orderSuccesful", { order: newOrder });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  processCheckout,
  placeOrder,
};
