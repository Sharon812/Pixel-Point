const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const Brand = require("../../models/brandSchema");
const cloudinary = require("../../config/cloudinary");

const getProductInfo = async (req, res) => {
  try {
    const category = await Category.find({ isListed: true });
    const brand = await Brand.find({ isBlocked: false });
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
    const { productName, brand, description, category, combos } = req.body;

    // Check if the product already exists
    const ProductExists = await Product.findOne({ productName });
    if (ProductExists) {
      return res
        .status(400)
        .send("Product already exists, try another product");
    }

    // Upload images to Cloudinary
    const imageUrl = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const result = await cloudinary.uploader.upload(req.files[i].path, {
          quality: "100",
        });
        imageUrl.push(result.secure_url); // Push the URL to the array
      }
    }

    // Initialize combosArray
    let combosArray = [];

    // Parse combos if provided
    if (combos) {
      combosArray = JSON.parse(combos);
      combosArray.forEach((combo) => {
        if (combo.color && typeof combo.color === "string") {
          combo.color = combo.color.split(",").map((color) => color.trim());
        }
      });
    }
    console.log("combios",combos)

    // Find category by name
    const categoryId = await Category.findOne({ name: category });
    if (!categoryId) {
      return res.status(400).send("Category not found");
    }
    const brandId = await Brand.findOne({ brandName: brand });
    console.log('here',brandId);
    // Create and save the new product
    const newProduct = new Product({
      productName,
      description,
      brand: brandId._id,
      category: categoryId._id, // Store category ID
      combos: combosArray,
      productImage: imageUrl,
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
