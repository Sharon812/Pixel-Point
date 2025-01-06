const brand = require("../../models/brandSchema");
const product = require("../../models/productSchema");
const cloudinary = require("../../config/cloudinary");

const getBrandPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 2;
    const skip = (page - 1) * limit;
    const brandData = await brand
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalBrands = await brand.countDocuments();
    const totalPages = Math.ceil(totalBrands / limit);

    res.render("brandPage", {
      brands: brandData,
      currentPage: page,
      totalPages: totalPages,
      totalBrands: totalBrands,
    });
  } catch (error) {
    console.log("error at brandpage", error);
    return res.redirect("/page-not-found");
  }
};

//for adding brands
const addBrand = async (req, res) => {
  try {
    const name = req.body.name;
    console.log(req.body);
    const findBrand = await brand.findOne({ name });
    console.log(req.files);
    if (!findBrand) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        quality: "100",
      });
      const newBrand = new brand({
        brandName: name,
        brandImage: result.url,
      });

      await newBrand.save();
    }
    res.redirect("/admin/brands");
  } catch (error) {
    console.log("error occured while adding brand", error);
    res.redirect("/page-not-found");
  }
};

//for doing soft delete
const blockBrand = async (req, res) => {
  try {
    const id = req.query.id;
    await brand.updateOne({ _id: id }, { $set: { isBlocked: true } });
    res.redirect("/admin/brands");
  } catch (error) {}
};

module.exports = {
  getBrandPage,
  addBrand,
  blockBrand,
};
