const Products = require("../../models/productSchema");
const category = require("../../models/categorySchema");
const User = require("../../models/userSchema");

const productDetails = async (req, res) => {
  try {
    const user = req.session.user;
    const productId = req.params.productId;
    const userData = await User.findById(user);
    const product = await Products.findById(productId, { isBlocked: false })
      .populate("category")
      .populate("brand");

    const relatedProducts = await Products.find({
      category: product.category,
      isBlocked: false,
      _id: { $ne: productId },
    })
      .populate("category")
      .populate("brand")
      .limit(4)
      .lean();

    const findCategory = product.category;
    const categoryOffer = findCategory?.categoryOffer || 0;
    const productOffer = product.productOffer || 0;
    const totalOffer = categoryOffer + productOffer;

    if (user) {
      res.render("productDetail", {
        product: product,
        category: findCategory,
        totalOffer: totalOffer,
        relatedProducts: relatedProducts,
        user: userData,
      });
    } else {
      res.render("productDetail", {
        product: product,
        category: findCategory,
        totalOffer: totalOffer,
        relatedProducts: relatedProducts,
      });
    }
  } catch (error) {
    console.log("Error at productDetails:", error);
    res.redirect("/page-not-found");
  }
};

//for getting product combo
const loadComboDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { ram, storage, color, comboId } = req.query;
    console.log("combs", comboId);

    const product = await Products.findById(id);
    console.log(product);
    const selectedCombo = product.combos.find(
      (combo) =>
        combo.ram === ram &&
        combo.storage === storage &&
        combo.color.includes(color)
    );
    console.log("selectedcombo", selectedCombo);
    if (!selectedCombo) {
      return res
        .status(404)
        .json({ success: false, message: "Combo not found" });
    }

    return res.json({
      success: true,
      combo: {
        salePrice: selectedCombo.salePrice,
        regularPrice: selectedCombo.regularPrice,
        quantity: selectedCombo.quantity,
        combosId: selectedCombo._id,
      },
    });
  } catch (error) {
    console.error("Error loading combo details:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  productDetails,
  loadComboDetails,
};
