const Category = require("../../models/categorySchema");
const Product = require("../../models/productSchema");

//function to display category details
const categoryInfo = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 3;
    const skip = (page - 1) * limit;
    const categoryData = await Category.find({ isListed: true })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    res.render("category", {
      cat: categoryData,
      currentPage: page,
    });
  } catch (error) {
    console.log("errpr at category info,", error);
    res.redirect("/page-not-found");
  }
};

//function to add category
const addCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ error: "Category already exists" });
    }

    const newCategory = new Category({
      name,
      description,
    });
    await newCategory.save();
    return res.json({ message: "Category added successfully" });
  } catch (error) {
    console.log("error at add category,", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//function to delete category
const deleteCategory = async (req, res) => {
  const id = req.query.id;
  try {
    await Category.updateOne({ _id: id }, { $set: { isListed: false } });
    return res.status(200).json({ response: "category deleted successfully" });
  } catch (error) {
    console.log("error at delete category,", error);
    return res.redirect("/page-not-found");
  }
};

//function to get edit category page
const geteditCategory = async (req, res) => {
  const id = req.query.id;
  try {
    const category = await Category.findOne({ _id: id });
    res.render("editCategory", {
      category,
    });
  } catch (error) {
    console.log("error at edit category,", error);
    res.redirect("/page-not-found");
  }
};

//function to update category
const editCategory = async (req, res) => {
  try {
    const id = req.params.id;

    const { categoryname, description } = req.body;
    const existingCategory = await Category.findOne({ name: categoryname });
    if (existingCategory) {
      return res.status(400).json({ error: "Category already exists" });
    }
    const updateCategory = await Category.findByIdAndUpdate(
      id,
      {
        name: categoryname,
        description: description,
      },
      { new: true }
    ); //we get return of updated data
    if (updateCategory) {
      res.status(200).json({ response: "updated successfully" });
    } else {
      res.status(400).json({ error: "Category not updated" });
    }
  } catch (error) {
    console.log(error, "error at edit category");
    res.status(500).json({ error: "Internal server error" });
  }
};

const addCateogoryOffer = async (req, res) => {
  try {
    const { categoryId, offerPercentage, endDate } = req.body;
    console.log("body", categoryId, offerPercentage, endDate);
    if (!categoryId && !offerPercentage && !endDate) {
      return res.status(400).json({ error: "Please fill all the fields" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ error: "Category not found" });
    }
    console.log("category", category);
    category.categoryOffer = offerPercentage;
    category.offerEndDate = endDate;
    await category.save();
    await calculateDiscountedPrice(categoryId, offerPercentage);
    res.status(200).json({ success: true, response: "added successfully" });
  } catch (error) {
    console.log(error, "error at add category offer");
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
const calculateDiscountedPrice = async (categoryId, offerPercentage) => {
  try {
    const products = await Product.find({ category: categoryId });
    console.log("Products:", products);
    const updatedProducts = products.map(async (product) => {
      product.combos.forEach((combo) => {
        combo.discountedPrice = Math.round(
          combo.salePrice - (combo.salePrice * offerPercentage) / 100
        );
      });
      return product.save();
    });
    await Promise.all(updatedProducts);
    console.log("Discounted prices updated successfully");
  } catch (error) {
    console.error("Error updating discounted prices:", error);
  }
};

const removeOffer = async (req, res) => {
  try {
    const { categoryId } = req.body;
    if (!categoryId) {
      return res
        .status(400)
        .json({ success: false, message: "no category id available" });
    }
    const category = await Category.findByIdAndUpdate(categoryId, {
      $set: { categoryOffer: 0, offerEndDate: null },
    });

    if (!category) {
      return res
        .status(400)
        .json({ success: false, message: "unable to remove offer" });
    }
    const products = await Product.find({
      category: categoryId,
    });
    const updatedProducts = products.map(async (product) => {
      product.combos.forEach((combo) => {
        combo.discountedPrice = null;
      });
      return product.save();
    });
    await Promise.all(updatedProducts);

    return res
      .status(200)
      .json({ success: true, message: "offer removed successfully" });
  } catch (error) {
    console.log(error, "error removing offer");
    return res
      .status(500)
      .json({ success: false, message: "internal server errror" });
  }
};

module.exports = {
  categoryInfo,
  addCategory,
  deleteCategory,
  geteditCategory,
  editCategory,
  addCateogoryOffer,
  removeOffer,
};
