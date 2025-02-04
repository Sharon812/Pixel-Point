const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const Brand = require("../../models/brandSchema");
const User = require("../../models/userSchema");
const cart = require("../../models/cartSchema");
const Order = require("../../models/orderSchema");

const getOrderDetails = async (req, res) => {
  try {
    // Get page number from query params, default to 1
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Items per page
    const skip = (page - 1) * limit;

    // Get total count of orders for pagination
    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / limit);

    // Fetch paginated orders
    const orders = await Order.find()
      .populate("userId", "name")
      .populate("orderedItems.product", "productName price _id")
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit);

    const transformedOrders = orders.flatMap((order) =>
      order.orderedItems.map((item) => ({
        orderId: order.orderId,
        customerName:
          order.userId && order.userId.name ? order.userId.name : "Unknown",
        productId: item.product ? item.product._id : null,
        productName: item.product
          ? item.product.productName
          : "Unknown Product",
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
        itemStatus: item.status,
        orderStatus: order.status,
        totalAmount: order.FinalAmount,
        orderDate: order.createdAt
      }))
    );

    res.render("orderDetailss", {
      orders: transformedOrders,
      currentPage: page,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page + 1,
      prevPage: page - 1,
      lastPage: totalPages
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send("Error fetching orders");
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
