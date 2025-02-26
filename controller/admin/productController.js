const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const Brand = require("../../models/brandSchema");
const cloudinary = require("../../config/cloudinary");
const brands = require("../../models/brandSchema");

const getProductInfo = async (req, res) => {
  try {
    const category = await Category.find({ isListed: true });
    const brand = await Brand.find({ isBlocked: false });
    res.render("addProduct", {
      cat: category,
      brand: brand,
      currentPage: "addProduct",
    });
  } catch (error) {
    console.log(error, "error at getting product page");
    res.redirect("/page-not-found");
  }
};

//to add product
const addProducts = async (req, res) => {
  try {
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
    console.log("combios", combos);

    // Find category by name
    const categoryId = await Category.findOne({ name: category });
    if (!categoryId) {
      return res.status(400).send("Category not found");
    }
    const brandId = await Brand.findOne({ brandName: brand });
    console.log("here", brandId);
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

//for all products listing
const getAllProducts = async (req, res) => {
  try {
    let search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 4;

    const productData = await Product.find({
      isBlocked: false,
      productName: { $regex: new RegExp(".*" + search + ".*", "i") },
    })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate("category")
      .populate("brand");

    const count = await Product.find({
      productName: { $regex: new RegExp(".*" + search + ".*", "i") },
    }).countDocuments();

    const categories = await Category.find({ isListed: true });
    const brands = await Brand.find({ isBlocked: false });

    const topSellingProducts = await Product.aggregate([
      {
        $match: { isBlocked: false }, // Only include non-blocked products
      },
      {
        $addFields: {
          totalSoldCount: { $sum: "$combos.soldCount" }, // Sum all soldCount values in combos
        },
      },
      {
        $sort: { totalSoldCount: -1 }, // Sort by totalSoldCount in descending order
      },
      {
        $limit: 5, // Get top 5 products
      },
    ]);

    console.log(topSellingProducts);

    if (categories && brands) {
      res.render("products", {
        productData,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        categories,
        brands,
        currentPage: "products",
        topSellingProducts,
      });
    } else {
      res.redirect("/page-not-found");
    }
  } catch (error) {
    console.error("Error at getting products:", error);
    res.status(500).send("Server Error");
  }
};

//for soft deleting products
const deleteProducts = async (req, res) => {
  try {
    const id = req.query.id;
    console.log("Product ID to delete:", id);

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: { isBlocked: true } },
      { new: true }
    );

    if (updatedProduct) {
      res.status(200).json({ response: "Product deleted successfully" });
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    console.log("Error deleting product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//for editing products
const getEditProducts = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await Product.findById(id)
      .populate("brand")
      .populate("category");
    const category = await Category.find({});
    const brand = await Brand.find({});
    res.render("editProducts", {
      product: product,
      cat: category,
      brand: brand,
      currentPage: "products",
    });
  } catch (error) {
    console.log("Error found in the loading Edit Product side: ", error);
    res.redirect("/page-not-found");
  }
};

const editProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const existingProduct = await Product.findOne({
      productName: data.productName,
      _id: { $ne: id },
    });

    if (existingProduct) {
      return res.status(400).json({
        error:
          "Product with this name already exists! Please try again with another name",
      });
    }

    const images = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const result = await cloudinary.uploader.upload(req.files[i].path, {
          quality: "100",
        });

        images.push(result.secure_url);
      }
    }

    // Ensure combos are parsed as an array of objects
    let combosArray = [];
    if (typeof data.combos === "string") {
      combosArray = JSON.parse(data.combos);
    } else if (Array.isArray(data.combos)) {
      combosArray = data.combos;
    }

    // Fetch existing product
    const existingProductData = await Product.findById(id);

    if (existingProductData) {
      combosArray = combosArray.map((newCombo) => {
        // Try to find an existing combo with the same RAM & storage (or another identifier)
        const existingCombo = existingProductData.combos.find(
          (combo) =>
            combo.ram === newCombo.ram && combo.storage === newCombo.storage
        );

        // If it exists, retain its properties (including the `_id`)
        if (existingCombo) {
          return { ...existingCombo.toObject(), ...newCombo };
        }

        // If it's a new combo, assign a new ObjectId manually
        return { ...newCombo, _id: new mongoose.Types.ObjectId() };
      });
    }

    const brand = await Brand.findOne({ brandName: data.brand });
    const category = await Category.findOne({ name: data.category });

    const updateFields = {
      productName: data.productName,
      description: data.description,
      brand: brand._id,
      category: category._id,
      combos: combosArray,
    };

    if (req.files.length > 0) {
      updateFields.$push = { productImage: { $each: images } };
    }

    await Product.findByIdAndUpdate(id, updateFields, { new: true });
    console.log("Product edited successfully!");
    res.status(200).json({ message: "Product edited successfully!" });
  } catch (error) {
    console.log("Error found in Edit Product side: ", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

//for deleting images
const deleteSingleImage = async (req, res) => {
  try {
    let { imagePublicId, productId } = req.body;

    console.log("Original imagePublicId:", imagePublicId);
    let imageId;
    // code to get public id from  url
    if (imagePublicId.startsWith("http")) {
      const parts = imagePublicId.split("/");
      const fileName = parts[parts.length - 1];
      imageId = fileName.split(".")[0];
    }

    console.log("Extracted public_id:", imageId);

    // deletind the image from Cloudinary
    const result = await cloudinary.uploader.destroy(imageId);
    console.log("result", result);
    if (result.result !== "ok") {
      console.error("Error deleting image from Cloudinary:", result);
      return res.status(500).send({
        status: false,
        message: "Failed to delete image from Cloudinary",
        error: result,
      });
    }

    console.log(`Image ${imagePublicId} deleted from Cloudinary successfully.`);

    const product = await Product.findByIdAndUpdate(
      productId,
      { $pull: { productImage: imagePublicId } },
      { new: true }
    );
    console.log("product", product);
    if (!product) {
      return res
        .status(404)
        .send({ status: false, message: "Product not found" });
    }

    // Step 3: Respond with success
    res.send({ status: true, message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error in deleteSingleImage:", error.message);
    res.status(500).send({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const addOffer = async (req, res) => {
  try {
    const { productId, offerPercentage, endDate } = req.body;
    if (!productId || !offerPercentage || !endDate) {
      return res.status(400).json({ error: "Please fill all the fields" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ error: "Product not found" });
    }
    if (product.offerPercentage >= offerPercentage) {
      return res.json({ success: false, message: "Offer Already exists" });
    }
    product.productOffer = true;
    product.offerPercentage = offerPercentage;
    product.offerEndDate = endDate;
    if (product.combos && Array.isArray(product.combos)) {
      product.combos.forEach((combo) => {
        combo.salePriceBeforeDiscount = combo.salePrice;
        combo.salePrice = Math.round(
          combo.salePriceBeforeDiscount -
            (combo.salePriceBeforeDiscount * offerPercentage) / 100
        );
      });
    }
    await product.save();

    res
      .status(200)
      .json({ success: true, message: "Offer added successfully" });
  } catch (error) {
    console.log(error, "error at adding offer");
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const removeOffer = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ error: "product Id missing" });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ error: "Product not found" });
    }
    if(product.productOffer == false){
      return res.status(400).json({success:false,message:"Product offer is not applied"})
    }

    product.productOffer = false;
    product.offerPercentage = 0;
    product.offerEndDate = null;
    if (product.combos && Array.isArray(product.combos)) {
      product.combos.forEach((combo) => {
        combo.salePrice = combo.salePriceBeforeDiscount;
        combo.salePriceBeforeDiscount = null;
      });
    }
    await product.save();

    res
      .status(200)
      .json({ success: true, message: "Offer added successfully" });
  } catch (error) {
    console.log(error, "error at adding offer");
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getProductInfo,
  addProducts,
  getAllProducts,
  deleteProducts,
  getEditProducts,
  editProduct,
  deleteSingleImage,
  addOffer,
  removeOffer,
};
