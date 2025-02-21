const mongoose = require("mongoose");
const { Schema } = mongoose;

const brandSchema = new Schema({
  brandName: {
    type: String,
    required: true,
  },
  brandImage: {
    type: String,
    required: true,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  soldCount: {
    type: Number,
    default: 0,
  },
});

const brands = mongoose.model("Brands", brandSchema);

module.exports = brands;
