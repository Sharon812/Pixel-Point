const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema({
  productName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: false, //for timebeing
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  regularPrice: {
    type: Number,
    default: 0,
  },
  salePrice: {
    type: Number,
    default: 0,
  },
  quantity: {
    type: Number,
    default: true,
  },
  color: {
    type: String,
    required: true,
  },
  productImage: {
    type: [String],
    required: false,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["Available" , "Out of stock", "Discountinued"],
    required: true,
    default: "Available",
  },
  CreatedOn: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
