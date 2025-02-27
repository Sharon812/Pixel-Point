const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const Brand = require("../../models/brandSchema");
const User = require("../../models/userSchema");
const cart = require("../../models/cartSchema");
const Order = require("../../models/orderSchema");
const Address = require("../../models/addressSchema")
const Wallet = require("../../models/walletSchema");

const getOrderDetails = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / limit);

    const orders = await Order.find({
      paymentStatus: { $ne: "Pending Payment" },
    })
      .populate("userId", "name")
      .populate("orderedItems.product", "productName price _id")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const transformedOrders = orders.flatMap((order) =>
      order.orderedItems.map((item) => ({
        orderId: order.orderId,
        orderItemId:item._id,
        customerName:
          order.userId && order.userId.name ? order.userId.name : "Unknown",
        productId: item.product ? item.product._id : null,
        productName: item.product
          ? item.product.productName
          : "Unknown Product",
        quantity: item.quantity,
        price: item.price,
        finalAmount: item.finalAmount,
        totalPrice: item.totalPrice,
        itemStatus: item.status,
        orderStatus: order.status,
        totalAmount: order.FinalAmount,
        orderDate: order.createdAt,
      }))
    );

    const returnRequestedProducts = orders.flatMap((order) =>
      order.orderedItems
        .filter((item) => item.status === "Return Requested")
        .map((item) => ({
          name:
            order.userId && order.userId.name ? order.userId.name : "Unknown",
          orderItemId: item._id,
          orderId: order.orderId,
          productName: item.product?.productName || "Unknown Product",
          quantity: item.quantity,
          price: item.price,
          finalAmount: item.finalAmount,
          cancellationReason: item.cancellationReason || null,
          status: item.status,
        }))
    );

    console.log(returnRequestedProducts, "returend reqested");
    res.render("orderDetailss", {
      orders: transformedOrders,
      currentPage: page,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page + 1,
      prevPage: page - 1,
      lastPage: totalPages,
      returnedProducts: returnRequestedProducts,
      currentPage: "orders",
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send("Error fetching orders");
  }
};
const updateStatus = async (req, res) => {
  const { orderId, productId, status } = req.body;
  try {
    const order = await Order.findOne({ orderId });

    if (!order) {
      console.error("Order not found");
      return res.status(404).send("Order not found");
    }

    const orderedItem = order.orderedItems.find(
      (item) => item.product.toString() === productId
    );
    if (!orderedItem) {
      console.error("Product not found in order");
      return res.status(404).send("Product not found in order");
    }
    const productData = await Product.findById(orderedItem.product)
      .populate("brand")
      .populate("category");

    const brand = productData.brand;
    const category = productData.category;

    const comboIndex = productData.combos.findIndex(
      (combo) =>
        combo.ram === orderedItem.RAM &&
        combo.storage === orderedItem.Storage &&
        combo.color.includes(orderedItem.color)
    );
    switch (status) {
      case "Processing":
        orderedItem.processing_at = new Date();
        break;
      case "Shipped":
        orderedItem.shipped_at = new Date();
        break;
      case "Delivered":
        orderedItem.delivered_at = new Date();

        brand.soldCount = brand.soldCount || 0;
        category.soldCount = category.soldCount || 0;
        productData.combos[comboIndex].soldCount += orderedItem.quantity;
        brand.soldCount += orderedItem.quantity;
        category.soldCount += orderedItem.quantity;

        await Promise.all([brand.save(), category.save(), productData.save()]);
        break;

      case "Cancelled":
        orderedItem.canceled_at = new Date();

        productData.combos[comboIndex].quantity += orderedItem.quantity;
        if (productData.combos[comboIndex].quantity > 0) {
          productData.combos[comboIndex].status = "Available";
        }
        brand.soldCount = brand.soldCount || 0;
        category.soldCount = category.soldCount || 0;
        productData.combos[comboIndex].soldCount -= orderedItem.quantity;
        brand.soldCount -= orderedItem.quantity;
        category.soldCount -= orderedItem.quantity;

        await Promise.all([brand.save(), category.save(), productData.save()]);
        if (
          order.paymentMethod === "razorpay" ||
          order.paymentMethod === "wallet"
        ) {
          const refundAmount = orderedItem.finalAmount;
          let wallet = await Wallet.findOne({ user: order.userId });

          if (!wallet) {
            wallet = new Wallet({
              user: order.userId,
              balance: refundAmount,
              transactions: [],
            });
          } else {
            wallet.balance += refundAmount;
          }

          wallet.transactions.push({
            type: "credit",
            amount: refundAmount,
            date: new Date(),
            description: `Refund of product ${orderedItem.productName}`,
          });

          await wallet.save();
        }
        break;
      default:
        return res
          .status(400)
          .json({ success: false, message: "Invalid order status." });
    }

    orderedItem.status = status;

    await order.save();

    res.redirect("/admin/orders");
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "internal server error" });
  }
};

const confirmReturnOrder = async (req, res) => {
  try {
    const { orderId, itemId } = req.body;

    const order = await Order.findOne({
      orderId: orderId,
      "orderedItems._id": itemId,
    });

    if (!order) {
      return res
        .status(400)
        .json({ success: false, message: "Unable to find the order" });
    }

    let refundAmount = 0;
    let orderItem = order.orderedItems.find(
      (item) => item._id.toString() === itemId
    );

    if (!orderItem) {
      return res
        .status(400)
        .json({ success: false, message: "Item not found in order" });
    }

    orderItem = Array.isArray(orderItem) ? orderItem : [orderItem];


    await Promise.all(
      orderItem.map(async (item) => {
        const product = await Product.findById(item.product);
        const comboIndex = product.combos.findIndex(
          (combo) =>
            combo.ram === item.RAM &&
            combo.storage === item.Storage &&
            combo.color.includes(item.color)
        );

        product.combos[comboIndex].quantity += item.quantity;
        if (product.combos[comboIndex].quantity > 0) {
          product.combos[comboIndex].status = "Available";
        }

        await product.save();
      })
    );

    if (
      order.paymentMethod === "razorpay" ||
      order.paymentMethod === "wallet"
    ) {
      refundAmount = orderItem[0].finalAmount;
      let wallet = await Wallet.findOne({ user: order.userId });

      if (!wallet) {
        wallet = new Wallet({
          user: order.userId,
          balance: refundAmount,
          transactions: [],
        });
      } else {
        wallet.balance += refundAmount;
      }

      wallet.transactions.push({
        type: "credit",
        amount: refundAmount,
        date: new Date(),
        description: `Refund of product ${orderItem[0].productName}`,
      });

      await wallet.save();
    }

    orderItem[0].status = "Returned";
    await order.save();

    res
      .status(200)
      .json({ success: true, message: "Order returned successfully" });
  } catch (error) {
    console.log(error, "error confirm returning order");
    res.status(500).json({ error: "Internal server error" });
  }
};

const denyReturnOrder = async (req, res) => {
  try {
    const { orderId, itemId } = req.body;
    const order = await Order.findOneAndUpdate(
      {
        orderId: orderId,
        "orderedItems._id": itemId,
      },
      {
        $set: { "orderedItems.$.status": "Delivered" },
      },
      { new: true }
    );
    if (!order) {
      res
        .status(400)
        .json({ success: false, message: "Unable to find the order" });
    }

    res.status(200).json({ success: true, message: "Return denied" });
  } catch (error) {
    console.log(error, "error confirm returning order");
    res.status(500).json({ error: "internal server error" });
  }
};

const getFullOrderDetails = async (req, res) => {
  try {
    const { orderId , itemId} = req.query;

    const orders = await Order.findOne({ orderId: orderId }).populate(
      "orderedItems.product"
    );

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order details not found",
      });
    }


    const orderDetails = orders.orderedItems.filter(
      (item) => item._id.toString() === itemId
    );

    const addressDocuments = await Address.find({ userId: orders.userId });

    const specificAddress = addressDocuments
      .flatMap((doc) => doc.address) // Combine all address arrays
      .find((addr) => addr._id.toString() === orders.address.toString());

    res.render("viewOrderDetails", {
      orderDetails: orderDetails,
      orderData: orders,
      address: specificAddress,
      currentPage:"orders"
    });
  } catch (error) {
    console.log(error, "error at order details");
    res.redirect("/page-not-found");
  }
};

module.exports = {
  getOrderDetails,
  updateStatus,
  confirmReturnOrder,
  denyReturnOrder,
  getFullOrderDetails
};
