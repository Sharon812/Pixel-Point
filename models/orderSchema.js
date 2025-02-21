const mongoose = require("mongoose");
const { Schema } = mongoose;

const { v4: uuidv4 } = require("uuid");

const orderSchema = new Schema(
  {
    orderId: {
      type: String,
      default: () => uuidv4(),
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderedItems: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: {
          type: String,
          required: false,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        RAM: {
          type: String,
          required: true,
        },
        Storage: {
          type: String,
          required: true,
        },
        color: {
          type: String,
          required: true,
        },
        totalPrice: {
          type: Number,
          required: true,
        },
        dicountPrice: {
          type: Number,
          default: 0,
        },
        finalAmount: {
          type: Number,
          default: 0,
        },
        status: {
          type: String,
          required: true,
          enum: [
            "Pending",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled",
            "Return Requested",
            "Returned",
          ],
          default: "Pending",
        },
        cancellationReason: {
          type: String,
        },
        processing_at: {
          type: Date,
        },
        shipped_at: {
          type: Date,
        },
        return_reqested_at: {
          type: Date,
        },
        canceled_at: {
          type: Date,
        },
        returned_at: {
          type: Date,
        },
        delivered_at: {
          type: Date,
        },
      },
    ],
    paymentMethod: {
      type: "string",
    },
    paymentStatus: {
      type: String,
      required: true,
      ennu: ["Pending Payment", "Confirmed"],
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    FinalAmount: {
      type: Number,
      required: true,
    },
    address: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    invoiceDate: {
      type: Date,
    },
    couponCode: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
