const User = require("../../models/userSchema");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const env = require("dotenv").config();
const bycrypt = require("bcrypt");
const crypto = require("crypto");
const Address = require("../../models/addressSchema");
const Product = require("../../models/productSchema");
const Cart = require("../../models/cartSchema");

const getCart = async (req, res) => {
  try {
    const user = req.session.user;

    // Find the cart and populate product details
    const cartData = await Cart.findOne({ userId: user })
      .populate({
        path: "items.productId", // Populate the product
        populate: {
          path: "combos", // Populate the combos within the product
        },
      })
      .lean();

    if (!cartData) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Attach the specific combo details to each item
    cartData.items = cartData.items.map((item) => {
      if (item.productId && item.productId.combos) {
        // Find the specific combo matching comboId
        const specificCombo = item.productId.combos.find(
          (combo) => combo._id.toString() === item.comboId.toString()
        );
        return { ...item, combo: specificCombo || null }; // Attach the combo details
      }
      return item; // If no product or combo, return item as is
    });

    console.log(cartData); // Debugging the updated cart data

    res.render("cart", {
      cart: cartData,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const addToCart = async (req, res) => {
  try {
    console.log("Entered");

    const { productId, comboId } = req.params;
    const { quantity } = req.body;
    const user = req.session.user;

    // Validate inputs
    if (!productId || !comboId || !quantity || quantity <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid input data" });
    }

    // Fetch product and user data
    const productData = await Product.findById(productId);
    const userData = await User.findById(user);
    if (!productData) {
      return res
        .status(404)
        .json({ success: false, message: "Product not available" });
    }
    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Find the combo
    const combo = productData.combos.id(comboId);
    if (!combo) {
      return res
        .status(404)
        .json({ success: false, message: "Combo not found" });
    }

    // Check if the user already has a cart
    let cart = await Cart.findOne({ userId: userData._id });
    if (cart) {
      // Check if the product-combo pair exists in the cart
      const existingItem = cart.items.find(
        (item) =>
          item.productId.equals(productId) && item.comboId.equals(comboId)
      );
      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.price = combo.salePrice * existingItem.quantity; // Update item price
      } else {
        cart.items.push({
          productId: productId,
          quantity: quantity,
          price: combo.salePrice * quantity, // Add price per quantity
          comboId: comboId,
        });
      }
    } else {
      // Create a new cart
      cart = new Cart({
        userId: userData._id,
        items: [
          {
            productId: productId,
            quantity: quantity,
            price: combo.salePrice * quantity, // Set price per quantity
            comboId: comboId,
          },
        ],
      });
    }

    // Calculate totalPrice based on all items
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price, 0);

    await cart.save();

    res.status(200).json({ success: true, message: "Added to cart" });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//for entirely removing cart product
const deleteCartItem = async (req, res) => {
  try {
    const { cartId, itemId } = req.params;

    // Find the cart by its ID
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    // Find the item to delete from the cart
    const itemToDelete = cart.items.find(
      (item) => item._id.toString() === itemId
    );
    if (!itemToDelete) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    // Subtract the item's total price from the cart's total price
    const itemTotalPrice = itemToDelete.price || 0;
    cart.totalPrice = Math.max(0, cart.totalPrice - itemTotalPrice); // Prevent negative totalPrice

    // Remove the item from the items array
    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

    // Save the updated cart
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      updatedCart: cart, // Return the updated cart, including the new total price
    });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  getCart,
  addToCart,
  deleteCartItem,
};
