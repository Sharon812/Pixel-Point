const Products = require("../../models/productSchema");
const category = require("../../models/categorySchema");
const User = require("../../models/userSchema");

const productDetails = async (req, res) => {
    try {
      const user = req.session.user;
      const productId = req.params.productId;
  
      const product = await Products.findById(productId)
        .populate("category")
        .populate("brand"); // Correct model name
  
      const findCategory = product.category;
      const categoryOffer = findCategory?.categoryOffer || 0;
      const productOffer = product.productOffer || 0;
      const totalOffer = categoryOffer + productOffer;
  
      if(user){
      res.render("productDetail", {
        product: product,
        category: findCategory,
        totalOffer: totalOffer,
        user:user
      });
    }else{
    res.render("productDetail", {
        product: product,
        category: findCategory,
        totalOffer: totalOffer,
    })
}
  
    } catch (error) {
      console.log("Error at productDetails:", error);
      res.redirect("/page-not-found");
    }
  };

  //for getting product combo
  const loadComboDetails = async (req, res) => {
    try {
      console.log("heyu")
        const { id } = req.params
        const { ram, storage, color } = req.query;
        console.log(typeof id); // Should be 'string'

        console.log(req.params)
        console.log(req.query);
        
        const product = await Products.findById(id);
        console.log(product)
        const selectedCombo = product.combos.find(
            (combo) => combo.ram === ram && combo.storage === storage && combo.color.includes(color)
        );

        if (!selectedCombo) {
            return res.status(404).json({ success: false, message: "Combo not found" });
        }

        return res.json({
            success: true,
            combo: {
                salePrice: selectedCombo.salePrice,
                regularPrice: selectedCombo.regularPrice,
                quantity: selectedCombo.quantity,
            },
        });
    } catch (error) {
        console.error("Error loading combo details:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

  
module.exports = {
  productDetails,
  loadComboDetails
};
