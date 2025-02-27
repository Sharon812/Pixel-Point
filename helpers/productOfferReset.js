const Product = require("../models/productSchema");

const productOfferExpiration = async (req,res) => {
    try {

        const now = new Date()

        const products = await Product.find({
            productOffer:true,
            offerEndDate : {$lte:now}
        })
        
        if(products.length === 0){
            return console.log("no products availabe")
        }

        const updatedProducts = products.map(async(product) => {
            product.productOffer = false;
            product.offerPercentage = 0;
            product.offerEndDate = null;
            if (product.combos && Array.isArray(product.combos)) {
              product.combos.forEach((combo) => {
                combo.salePrice = combo.salePriceBeforeDiscount;
                combo.salePriceBeforeDiscount = null;
              });
            }
            return product.save()
        })
        await Promise.all(updatedProducts)

        console.log("Product offer removed from", products.length, "products");


    } catch (error) {
        console.log(error,"error at productofferrest corn job")
    }
}

module.exports = productOfferExpiration