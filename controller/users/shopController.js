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

const loadShopPage = async (req, res) => {
  try {
    const brands = await Brand.find({ isBlocked: false });
    const categories = await Category.find({ isListed: true });

    const {
      category: selectedCategory = "",
      brand: selectedBrand = "",
      priceRange: selectedPriceRange = "",
      ram: selectedRam = "",
      storage: selectedStorage = "",
      color: selectedColor = "",
      sort: selectedSort = "",
      search: searchQuery = "",
      page: queryPage = 1,
    } = req.query;

    const limit = 12; // Products per page
    const page = parseInt(queryPage) || 1;
    const skip = (page - 1) * limit;

    // Resolve category and brand names to IDs
    let categoryId = null;
    let brandId = null;

    if (selectedCategory) {
      const categoryDoc = await Category.findOne({ name: selectedCategory });
      categoryId = categoryDoc ? categoryDoc._id : null;
    }
    if (selectedBrand) {
      const brandDoc = await Brand.findOne({ brandName: selectedBrand });
      brandId = brandDoc ? brandDoc._id : null;
    }

    const matchStage = { $and: [] };

    if (categoryId) {
      matchStage.$and.push({ category: categoryId });
    }

    if (brandId) {
      matchStage.$and.push({ brand: brandId });
    }

    if (selectedPriceRange) {
      const maxPrice = parseFloat(selectedPriceRange);
      if (!isNaN(maxPrice)) {
        matchStage.$and.push({ "combos.salePrice": { $lte: maxPrice } });
      }
    }

    if (selectedRam) {
      matchStage.$and.push({ "combos.ram": selectedRam });
    }

    if (selectedStorage) {
      matchStage.$and.push({ "combos.storage": selectedStorage });
    }

    if (selectedColor) {
      matchStage.$and.push({ "combos.color": selectedColor });
    }

    if (searchQuery) {
      matchStage.$and.push({
        productName: { $regex: searchQuery, $options: "i" },
      });
    }

    if (matchStage.$and.length === 0) delete matchStage.$and;

    const sortOptions = {
      priceLowToHigh: { "combos.salePrice": 1 },
      priceHighToLow: { "combos.salePrice": -1 },
      alphabeticalAZ: { productName: 1 },
      alphabeticalZA: { productName: -1 },
      newArrivals: { createdAt: -1 },
      oldArrivals: { createdAt: 1 },
    };
    const sortStage = sortOptions[selectedSort] || {};

    const totalProducts = await Product.countDocuments(matchStage);

    const products = await Product.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brand",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$brand" },
      { $unwind: "$category" },
      ...(Object.keys(sortStage).length ? [{ $sort: sortStage }] : []),
      { $skip: skip },
      { $limit: limit },
    ]);
    const [colors, rams, storages] = await Promise.all([
      Product.distinct("combos.color"),
      Product.distinct("combos.ram"),
      Product.distinct("combos.storage"),
    ]);

    const user = req.session.user;
    let userData = null;
    let cartItemCount = 0;

    if (user) {
      const userId = user;
      const userCart = await Cart.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      });
      cartItemCount = userCart ? userCart.items.length : 0;
      userData = await User.findById(userId);
      if (userData && !userData.profileImage) {
        userData.initials = (userData.name || "")
          .replace(/\s+/g, "")
          .slice(0, 2)
          .toUpperCase();
      }
    }
    const totalPages = Math.ceil(totalProducts / limit);

    res.render("shop", {
      categories,
      brands,
      products,
      user: userData,
      cartItemCount,
      selectedCategory,
      selectedBrand,
      selectedPriceRange,
      selectedRam,
      selectedStorage,
      selectedColor,
      selectedSort,
      searchQuery,
      colors,
      rams,
      storages,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error("Error loading shop page:", error.message);
    res.redirect("/page404");
  }
};

module.exports = {
  loadShopPage,
};
