const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: false, //here its false because of google sign in
    unique: false,
    sparse: true,
    default: null,
  },
  googleId: {
    type: String,
    required: false, //here its false because of google sign in
    unique: false,
    default: null,
    sparse: true,
  },
  password: {
    type: String,
    required: false, //due to google sign in
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  cart: [
    {
      type: Schema.Types.ObjectId,
      ref: "Cart",
    },
  ],
  wallet: [
    {
      type: Schema.Types.ObjectId,
      ref: "whishlist",
    },
  ],
  OrderHistory: [
    {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  CreatedOn: {
    type: Date,
    default: Date.now,
  },
  searchHistory: [
    {
      category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
      brand: {
        type: String,
      },
      SearchOn: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});
const User = mongoose.model("User", userSchema);

module.exports = User;
