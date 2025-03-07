const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brands",
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    combos: [
      {
        ram: {
          type: String,
          required: true,
        },
        storage: {
          type: String,
          required: true,
        },
        regularPrice: {
          type: Number,
          required: true,
        },
        salePrice: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        color: {
          type: [String],
          required: true,
        },
        salePriceBeforeDiscount: {
          type: Number,
          default: null,
        },
        status: {
          type: String,
          enum: ["Available", "Out of Stock", "Discontinued"],
          required: true,
          default: "Available",
        },
        soldCount: {
          type: Number,
          default: 0,
        },
      },
    ],
    productImage: {
      type: [String],
      required: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    offerPercentage: {
      type: Number,
      default: 0,
    },
    productOffer:{
      type:Boolean,
      default:false
    },
    offerEndDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
