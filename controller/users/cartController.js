const User = require("../../models/userSchema");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const env = require("dotenv").config();
const bycrypt = require("bcrypt");
const crypto = require("crypto");
const Address = require("../../models/addressSchema");
const Product = require("../../models/productSchema");
const Cart = require("../../models/cartSchema");
const { response } = require("express");
const _ = require("lodash");

const getCart = async (req, res) => {
  try {
    const user = req.session.user;
    const userData = await User.findById(user);
    const cartData = await Cart.findOne({ userId: user })
      .populate({
        path: "items.productId",
        populate: {
          path: "combos",
        },
      })
      .lean();
    let stockMessage = false;
    if (!cartData) {
      return res.render("cart", {
        cart: cartData,
        user: userData,
        stockMessage: false,
      });
    }
    cartData.items = cartData.items.map((item) => {
      if (item.productId && item.productId.combos) {
        const specificCombo = item.productId.combos.find(
          (combo) => combo._id.toString() === item.comboId.toString()
        );
        console.log(specificCombo, "specificcombos");
        if (specificCombo && specificCombo.quantity <= 0) {
          stockMessage = true;
        }

        return { ...item, combo: specificCombo || null };
      }

      return item;
    });
    console.log(cartData, "cart");

    res.render("cart", {
      cart: cartData,
      user: userData,
      stockMessage,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, comboId } = req.params;
    const { quantity } = req.body;
    const user = req.session.user;

    if (!productId || !comboId || !quantity || quantity <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid input data" });
    }

    const productData = await Product.findById(productId);
    const userData = await User.findById(user);

    if (!productData) {
      return res
        .status(404)
        .json({ success: false, message: "Product not available" });
    }
    if (!userData) {
      return res.status(404).json({ success: false, message: "Login First" });
    }

    const combo = productData.combos.id(comboId);
    if (!combo) {
      return res
        .status(404)
        .json({ success: false, message: "Combo not found" });
    }
    let cart = await Cart.findOne({ userId: user });
    if (cart) {
      if (cart.items.length >= 5) {
        return res
          .status(400)
          .json({ success: false, message: "Can add 5 products at a time" });
      }
    }

    if (cart) {
      const existingItem = cart.items.find(
        (item) =>
          item.productId.equals(productId) && item.comboId.equals(comboId)
      );
      if (existingItem) {
        if (existingItem.quantity + quantity > combo.quantity) {
          return res
            .status(404)
            .json({ success: false, message: "Only one product remaining" });
        }

        if (existingItem.quantity >= 5) {
          return res.status(400).json({
            success: false,
            message: "can add 5 products of same stock",
          });
        }
      }

      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.totalPrice = combo.salePrice * existingItem.quantity;
      } else {
        cart.items.push({
          productId: productId,
          quantity: quantity,
          price: combo.salePrice,
          totalPrice: combo.salePrice * quantity,
          comboId: comboId,
        });
      }
    } else {
      cart = new Cart({
        userId: userData._id,
        items: [
          {
            productId: productId,
            quantity: quantity,
            price: combo.salePrice,
            totalPrice: combo.salePrice * quantity,
            comboId: comboId,
          },
        ],
      });
    }

    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );

    await cart.save();

    res.status(200).json({ success: true, message: "Added to cart" });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { cartId, itemId } = req.params;

    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const itemToDelete = cart.items.find(
      (item) => item._id.toString() === itemId
    );
    if (!itemToDelete) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    const itemTotalPrice = itemToDelete.totalPrice || 0;
    cart.totalPrice = Math.max(0, cart.totalPrice - itemTotalPrice);

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      updatedCart: cart,
    });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const addquantity = async (req, res) => {
  try {
    const user = req.session.user;
    const { comboId } = req.query;

    if (!user || !comboId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request" });
    }

    const cart = await Cart.findOne({ userId: user });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const product = cart.items.find((item) => item.comboId == comboId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in cart" });
    }
    if (product.quantity >= 5) {
      return res.json({
        success: false,
        message: "can add only 5 items",
      });
    }
    const productWithCombo = await Product.findOne(
      { "combos._id": comboId },
      { "combos.$": 1 }
    );

    if (!productWithCombo || !productWithCombo.combos.length) {
      return res
        .status(404)
        .json({ success: false, message: "Combo not found" });
    }

    const combo = productWithCombo.combos[0];
    if (product.quantity >= combo.quantity) {
      return res
        .status(400)
        .json({ success: false, message: `Only ${combo.quantity} available` });
    }
    if (product.quantity > 5) {
      return;
    }

    product.quantity += 1;

    product.totalPrice = product.quantity * combo.salePrice;

    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );

    await cart.save();

    return res
      .status(200)
      .json({ success: true, message: "Quantity updated", product, cart });
  } catch (error) {
    console.error("Error updating quantity:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const decreaseQuantity = async (req, res) => {
  try {
    const user = req.session.user;
    const { comboId } = req.query;

    if (!user || !comboId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request" });
    }

    const cart = await Cart.findOne({ userId: user });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const product = cart.items.find((item) => item.comboId == comboId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in cart" });
    }

    const productWithCombo = await Product.findOne(
      { "combos._id": comboId },
      { "combos.$": 1 }
    );

    if (!productWithCombo || !productWithCombo.combos.length) {
      return res
        .status(404)
        .json({ success: false, message: "Combo not found" });
    }

    console.log(product.quantity, "ifi");
    if (product.quantity <= 1) {
      console.log("belloo");
      return res.status(400).json({
        success: false,
        message: "Quantity cannot be less than one.",
      });
    } else {
      const combo = productWithCombo.combos[0];
      product.quantity -= 1;
      product.totalPrice = product.quantity * combo.salePrice;

      cart.totalPrice = cart.items.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );

      await cart.save();

      return res
        .status(200)
        .json({ success: true, message: "Quantity updated", product, cart });
    }
  } catch (error) {
    console.error("Error updating quantity:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
// 2 seconds throttle time

module.exports = {
  getCart,
  addToCart,
  deleteCartItem,
  addquantity,
  decreaseQuantity,
};
