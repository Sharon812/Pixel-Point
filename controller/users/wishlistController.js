const User = require("../../models/userSchema");
const mongoose = require("mongoose");
const Product = require("../../models/productSchema");
const Cart = require("../../models/cartSchema");
const Wishlist = require("../../models/wishlistSchema");

const getWishlist = async (req, res) => {
  try {
    const user = req.session.user;
    const userData = await User.findById(user);
    const wishlist = await Wishlist.findOne({ userId: user })
      .sort({ createdAt: 1 })
      .populate("product.productId");
    const cart = await Cart.findOne({ userId: user });
    const cartProductIds = cart
      ? cart.items.map((item) => item.productId.toString())
      : [];

    res.render("wishlist", {
      user: userData,
      wishlist: wishlist,
      cartProductIds: cartProductIds,
    });
  } catch (error) {
    console.log(error, "error at getting wishlist");
    res.redirect("/page-not-found");
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.session.user;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Combo Id or product Id not found" });
    }

    const productData = await Product.findById(productId);
    if (!productData) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    let wishlistData = await Wishlist.findOne({ userId: user });

    if (!wishlistData) {
      wishlistData = new Wishlist({
        userId: user,
        product: [
          {
            productId: productId,
          },
        ],
      });
    } else {
      wishlistData.product.push({
        productId: productId,
      });
    }

    await wishlistData.save();

    res.status(200).json({ success: true, message: "Item added to wishlist" });
  } catch (error) {
    console.log(error, "error at adding wishlist");
    res.status(500).json({ success: false, message: "Unable to add products" });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.session.user;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    const wishlistData = await Wishlist.findOne({ userId: user });

    if (!wishlistData) {
      return res
        .status(404)
        .json({ success: false, message: "Wishlist not found" });
    }

    // Remove only the matching product from the wishlist array
    const updatedWishlist = await Wishlist.findOneAndUpdate(
      { userId: user },
      { $pull: { product: { productId: productId } } }, // Removes the specific product
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Item removed from wishlist",
      wishlist: updatedWishlist,
    });
  } catch (error) {
    console.log(error, "error at removing wishlist item");
    res
      .status(500)
      .json({ success: false, message: "Unable to remove product" });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
