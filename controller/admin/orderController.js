const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const Brand = require("../../models/brandSchema");
const User = require("../../models/userSchema");
const cart = require("../../models/cartSchema");
const Order = require("../../models/orderSchema");

const getOrderDetails = async (req, res) => {
  try {
    // Fetch orders with user and product details populated
    const orders = await Order.find()
      .populate("userId", "name") // Populate user details (name field only)
      .populate("orderedItems.product", "productName price _id"); // Populate product details
    // Transform orders for the EJS page
    const transformedOrders = orders.flatMap((order) =>
      order.orderedItems.map((item) => ({
        orderId: order.orderId,
        customerName:
          order.userId && order.userId.name ? order.userId.name : "Unknown", // Handle missing user
        productId: item.product ? item.product._id : null, // Include product ID
        productName: item.product
          ? item.product.productName
          : "Unknown Product",
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
        itemStatus: item.status, // Status of the individual item
        orderStatus: order.status, // Overall order status
        totalAmount: order.FinalAmount, // Total final amount for the order
      }))
    );
    res.render("adminOrderDetails", { orders: transformedOrders });
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
const updateStatus = async (req, res) => {
  console.log(req.body);
  console.log(req.query);
  const { orderId, productId, status } = req.body;
  try {
    const order = await Order.findOne({ orderId });

    if (!order) {
      console.error("Order not found");
      return res.status(404).send("Order not found");
    }

    const product = order.orderedItems.find(
      (item) => item.product.toString() === productId
    );

    if (!product) {
      console.error("Product not found in order");
      return res.status(404).send("Product not found in order");
    }

    product.status = status;

    await order.save();
    console.log("Order updated successfully");

    res.redirect("/admin/orders");
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).send("Internal Server Error");
  }
};
module.exports = {
  getOrderDetails,
  updateStatus,
};
