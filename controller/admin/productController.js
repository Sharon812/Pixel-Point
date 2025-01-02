const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const Brand = require("../../models/brandSchema");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const getProductInfo = async (req, res) => {
  try {
    const category = await Category.find({ isListed: true });
    console.log(category);
    const brand = await Brand.find({ isBlocked: true });
    res.render("addProduct", {
      cat: category,
      brand: brand,
    });
  } catch (error) {}
};

module.exports = {
  getProductInfo,
};
