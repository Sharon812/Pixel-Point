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

    if(!user){
      return res.status(400).json({success:false,message:"Error, login first"})
    }

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
    const product = wishlistData.product.find(
      (item) => item.productId.toString() === productId
    );
    if (product) {
      await Wishlist.updateOne(
        { userId: user },
        { $pull: { product: { productId: productId } } }
      );
      console.log("Product removed from wishlist");
      return res
        .status(200)
        .json({ success: true, message: "Item removed from wishlist" });
    }
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

module.exports = {
  getWishlist,
  addToWishlist,
};
