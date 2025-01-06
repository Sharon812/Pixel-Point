const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const Brand = require("../../models/brandSchema");
const cloudinary = require("../../config/cloudinary");

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
    const product = req.body;
    const ProductExists = await Product.findOne({
      productName: product.productName,
    });

    if (ProductExists) {
      return res
        .status(400)
        .send("Product already exists, try another product");
    }

    const imageUrl = [];

    // Upload images to Cloudinary
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const result = await cloudinary.uploader.upload(req.files[i].path, {
          quality: "100",
        });
        imageUrl.push(result.secure_url); // Push the URL to the array
      }
    }

    // Find category by name
    const categoryId = await Category.findOne({ name: product.category });
    if (!categoryId) {
      return res.status(400).send("Category not found");
    }

    // Create and save the new product
    const newProduct = new Product({
      productName: product.productName,
      description: product.description,
      productImage: imageUrl, // Save image URLs array
      category: categoryId._id,
      regularPrice: product.regularPrice,
      salePrice: product.salePrice,
      quantity: product.quantity,
      color: product.color,
      status: "Available",
    });

    await newProduct.save();
    return res.status(200).json({ message: "Product added successfully!" });
  } catch (error) {
    console.error("Error saving product:", error);
    return res.status(500).redirect("/page-not-found");
  }
};

module.exports = {
  getProductInfo,
  addProducts,
};
