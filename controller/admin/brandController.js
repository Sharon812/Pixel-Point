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
    const topSellingBrands = await brand.find({ isBlocked: false })
    .sort({ soldCount: -1 })
    .limit(5);


    res.render("brandPage", {
      brands: brandData,
      currentPage: page,
      totalPages: totalPages,
      totalBrands: totalBrands,
      currentPage: "brands",
      topSellingBrands
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
    const findBrand = await brand.findOne({ name });
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
    const updatedBrand = await brand.findOneAndUpdate(
      { _id: id },
      { $set: { isBlocked: true } },
      { new: true }
    );
    res
      .status(200)
      .json({ success: true, message: "Blocked successfully", updatedBrand });
  } catch (error) {
    console.log("error blocking brands", error);
    res.status(500).json({ success: false, message: "internal server error" });
  }
};

const unblockBrand = async (req, res) => {
  try {
    const id = req.query.id;
    const updatedBrand = await brand.findOneAndUpdate(
      { _id: id },
      { $set: { isBlocked: false } },
      { new: true }
    );
    res
      .status(200)
      .json({ success: true, message: "unBlocked successfully", updatedBrand });
  } catch (error) {
    console.log(error, "error at unblocking brands");
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getBrandPage,
  addBrand,
  blockBrand,
  unblockBrand,
};
