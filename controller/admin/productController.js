const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const Brand = require("../../models/brandSchema");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const getProductInfo = async (req, res) => {
  try {
    const category = await Category.find({ isListed: true });
    const brand = await Brand.find({ isBlocked: true });
    res.render("addProduct", {
      cat: category,
      brand: brand,
    });
  } catch (error) {}
};

//to add product
const addProducts = async (req, res) => {
  try {
    console.log("here", req.body);
    const product = new Product(req.body);
    const ProductExists = Product.findOne({
      productName: product.productName,
    });
    if (!ProductExists) {
      const images = [];

      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const originalImagePath = req.files[i].path;

          const rezizedImagePath = path.join(
            "public",
            "uploads",
            "Product-images",
            req.files[i].filename
          );
          await sharp(originalImagePath)
            .resize({ width: 440, height: 440 })
            .toFile(rezizedImagePath);
          images.push(req.files[i].filename);
        }
      }

      const categoryId = await Category.findOne({ name: products.category });

      if (!categoryId) {
        return res.status(400).join("Category not found");
      }

      const newProduct = new Product({
        ProductName: product.productName,
        description: product.description,
        brand: product.brand,
        category: categoryId._id,
        regularPrice: product.regularPrice,
        salePrice: product.salePrice,
        quantity: product.quantity,
        color: product.color,
        status: "Available",
      });

      await newProduct.save();
      return res.redirect("/admin/addProduct");
    } else {
      return res
        .status(400)
        .send("Product already exists, try another product");
    }
  } catch (error) {
    console.log(error, "error saving product");
    return res.redirect("/page-not-found");
  }
};

module.exports = {
  getProductInfo,
  addProducts,
};
