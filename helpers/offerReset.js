const Category = require("../models/categorySchema");
const Product = require("../models/productSchema");

const checkIfCategoryOfferExpired = async (req,res) => {
    try {
        const now = Date()
        const categories = await Category.find({
            offerEndDate: { $lte: now },
            categoryOffer: { $gt: 0 },
          });
          console.log("Categories fetched:", categories);
          for (const category of categories) {
        
              category.categoryOffer = 0;
              category.offerEndDate = null;
              await category.save();
              console.log(`Category "${category.name}" offer reset.`);

              const products = await Product.find({
                category: category._id,
              });
              console.log(products,"products")

              const updatedProducts = products.map(async (product) => {
              
              let shouldUpdate = false

              if(product.productOffer == false){
                shouldUpdate = true
              }


                product.combos.forEach((combo) => {
                  if(shouldUpdate){
                    product.offerPercentage = 0;
                    combo.salePrice = combo.salePriceBeforeDiscount;
                    combo.salePriceBeforeDiscount = null;
                  }
                });
               if(shouldUpdate){
                return product.save();
               }
              });
              await Promise.all(updatedProducts);
          
          }  
          if(categories.length === 0){
            console.log("no category offer found")
          }

    } catch (error) {
        console.log(error,"error at checking category offere expiration in offer reset")
    }
}

module.exports = checkIfCategoryOfferExpired