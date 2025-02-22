const User = require("../../models/userSchema");
const mongoose = require("mongoose");
const env = require("dotenv").config();
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Address = require("../../models/addressSchema");
const Product = require("../../models/productSchema");
const Cart = require("../../models/cartSchema");
const Brand = require("../../models/brandSchema");
const Category = require("../../models/categorySchema");
const Order = require("../../models/orderSchema");
const Wallet = require("../../models/walletSchema");
const Coupons = require("../../models/couponSchema");
const PDFDocument = require("pdfkit");

const processCheckout = async (req, res) => {
  try {
    const userId = req.session.user;
    const userData = userId ? await User.findById(userId) : null;
    const brand = await Brand.find({});
    const addresses = await Address.find({ userId: userId });
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      return res
        .status(404)
        .json({ sucess: false, message: "no cart available" });
    }

    for (const item of cart.items) {
      if (item.comboId) {
        console.log(item.comboId, "itembcoboit");
        const product = await Product.findById(item.productId);
        console.log(product, "product in checkout");
        if (!product) {
          return res.status(404).json({
            success: false,
            message: "Product not available",
          });
        }

        const combo = product.combos.find(
          (combo) => combo._id.toString() === item.comboId.toString()
        );
        console.log(combo, "combohere");
        if (!combo) {
          res.status(400).json({
            success: false,
            message: "Combo not available",
          });
        }

        item.comboDetails = combo;
      }
    }
    const address = addresses.flatMap((doc) => doc.address);
    const validCartItems = cart.items.filter((item) => item.quantity > 0);
    for (const item of validCartItems) {
      const availableQuantity = item.comboDetails
        ? item.comboDetails.quantity
        : item.productId.stock;
      if (availableQuantity < 1) {
        outofstock = true;
      }
    }
    const totalPrice = validCartItems.reduce(
      (sum, item) =>
        sum +
        (item.comboDetails ? item.comboDetails.salePrice : item.price) *
          item.quantity,
      0
    );

    const cartSummary = {
      totalPrice,
    };

    res.render("checkOut", {
      cart: { items: validCartItems },
      brand,
      cartSummary,
      user: userData,
      totalPrice,
      address,
    });
  } catch (error) {
    console.error("Error processing checkout:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

//for placing order
const placeOrder = async (req, res) => {
  try {
    const userId = req.session.user;
    const { selectedAddress, paymentMethod, couponCode, discount } = req.body;
    console.log(req.body, "redfjo");

    if (!selectedAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Missing order details",
      });
    }

    const cart = await Cart.findOne({ userId })
      .populate({
        path: "items.productId",
        populate: { path: "combos", model: "Combo" },
      })
      .lean();
    const cartItemLength = cart.items.length;
    let discountPerProduct = 0;
    if (discount !== null) {
      discountPerProduct = Math.round(discount / cartItemLength);
    }
    if (!cart?.items?.length) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    const orderItems = [];

    for (const item of cart.items) {
      const selectedCombo = item.productId.combos.find(
        (combo) => combo._id.toString() === item.comboId.toString()
      );

      if (!selectedCombo) {
        throw new Error(
          `Combo not found for product: ${item.productId.productName}`
        );
      }

      if (selectedCombo.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: ` ${item.productId.productName} is out of stock`,
        });
      }

      const addressData = await Address.findOne({ userId: userId });
      const addressDetails = addressData.address.filter((address) => {
        address.id.toString() === selectedAddress.toString();
      });
      console.log(addressDetails, "adders");

      orderItems.push({
        product: item.productId._id,
        productName: item.productId.productName,
        quantity: item.quantity,
        price: selectedCombo.salePrice,
        totalPrice: item.quantity * selectedCombo.salePrice,
        dicountPrice: discountPerProduct,
        finalAmount:
          item.quantity * selectedCombo.salePrice - discountPerProduct,
        RAM: selectedCombo.ram,
        Storage: selectedCombo.storage,
        color: selectedCombo.color[0],
        status: "Pending",
      });
    }

    const totalAmount = orderItems.reduce(
      (acc, item) => acc + item.totalPrice,
      0
    );

    const finalAmount = req.body.discountedTotal || totalAmount;

    if (paymentMethod === "Cash on Delivery" && finalAmount > 100000) {
      return res.status(400).json({
        success: false,
        message: "Cash on Delivery is not available for orders above ₹10,000",
      });
    }

    const newOrder = new Order({
      userId: userId,
      address: selectedAddress,
      paymentMethod,
      orderedItems: orderItems,
      totalPrice: totalAmount,
      discount: discount,
      FinalAmount: finalAmount,
      couponCode: couponCode || null,
      paymentStatus:
        paymentMethod === "Cash on Delivery" || paymentMethod === "wallet"
          ? "Confirmed"
          : "Pending Payment",
    });
    await newOrder.save();
    console.log(newOrder, "iodjfiodsjfoij");
    console.log(newOrder, "iodjfiodsjfoij");
    if (paymentMethod === "Cash on Delivery") {
      await updateInventory(orderItems, userId);
      await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });
      if (discount > 0) {
        const couponData = await Coupons.findOne({ name: couponCode });
        couponData.usesCount += 1;
        await couponData.save();
      }
      console.log(newOrder, "neworder");

      return res.json({
        success: true,
        message: "COD order placed successfully",
        order: newOrder,
      });
    }

    if (paymentMethod === "wallet") {
      const wallet = await Wallet.findOne({ user: userId });
      if (!wallet) {
        return res
          .status(400)
          .json({ success: false, message: "Insufficient Amount in wallet" });
      }

      if (wallet.balance < finalAmount) {
        return res
          .status(400)
          .json({ success: false, message: "Insufficient Balance" });
      }
      wallet.balance = wallet.balance - finalAmount;
      wallet.transactions.push({
        type: "debit",
        amount: finalAmount,
        date: new Date(),
        description: `${finalAmount} debited for purchasing `,
      });
      await wallet.save();
      if (discount > 0) {
        const couponData = await Coupons.findOne({ name: couponCode });
        couponData.usesCount += 1;
        await couponData.save();
      }
      await updateInventory(orderItems, userId);
      await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

      return res
        .status(200)
        .json({ success: true, message: "Order Placed", order: newOrder });
    }
    console.log(finalAmount, "finalamount");
    if (paymentMethod === "razorpay") {
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(finalAmount * 100),
        currency: "INR",
        receipt: newOrder._id.toString(),
        payment_capture: 1,
      });
      if (discount > 0) {
        console.log("under");
        const couponData = await Coupons.findOne({ name: couponCode });
        couponData.usesCount += 1;
        await couponData.save();
      }
      await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

      return res.json({
        success: true,
        message: "Razorpay order created",
        razorpayOrder: razorpayOrder,
        order: newOrder,
        finalAmount: finalAmount,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid payment method",
    });
  } catch (error) {
    console.error("Order placement error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Order placement failed",
    });
  }
};

const updateInventory = async (orderItems, userId) => {
  await Promise.all(
    orderItems.map(async (item) => {
      const product = await Product.findById(item.product);
      const comboIndex = product.combos.findIndex(
        (combo) =>
          combo.ram === item.RAM &&
          combo.storage === item.Storage &&
          combo.color.includes(item.color)
      );

      if (comboIndex === -1) throw new Error("Combo not found");

      if (product.combos[comboIndex].quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.productName}`);
      }

      product.combos[comboIndex].quantity -= item.quantity;
      if (product.combos[comboIndex].quantity === 0) {
        product.combos[comboIndex].status = "Out of Stock";
      }

      await product.save();
    })
  );
};

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
    } = req.body;

    if (!razorpay_payment_id) {
      console.log("Payment failed, updating order status.");

      return res.status(400).json({
        success: false,
        message: "Payment failed or user canceled",
        order: order.orderId,
      });
    }
    if (!razorpay_payment_id) {
      console.log("Payment failed, updating order status.");

      return res.status(400).json({
        success: false,
        message: "Payment failed or user canceled",
        order: order.orderId,
      });
    }
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(sign.toString())
      .digest("hex");
    const order = await Order.findById(order_id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    if (razorpay_signature === expectedSign) {
      order.paymentStatus = "Confirmed";
      await order.save();
      await Cart.findOneAndUpdate(
        { userId: order.userId },
        { $set: { items: [] } }
      );
      await updateInventory(order.orderedItems, order.userId);
      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        order: order.orderId,
      });
    } else {
      console.log("here,sdnojdiovcsne");
      console.log("here,sdnojdiovcsne");
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
        order: order.orderId,
        order: order.orderId,
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying payment",
    });
  }
};

const orderPlaced = async (req, res) => {
  try {
    const { orderId } = req.query;
    const order = await Order.findOne({ orderId: orderId });
    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "unable to find orderdetails" });
    }
    res.render("orderPlaced", {
      order: order,
    });
  } catch (error) {
    console.log(error, "errror at rendering order placed page");
    res.redirect("/page-not-found");
  }
};

const orderPending = async (req, res) => {
  try {
    const { orderId } = req.query;
    const order = await Order.findOne({ _id: orderId });
    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "unable to find orderdetails" });
    }
    res.render("orderPending", {
      order: order,
    });
  } catch (error) {
    console.log(error, "errror at rendering order placed page");
    res.redirect("/page-not-found");
  }
};

//for retry payment

const retryPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    console.log("hey");
    if (!orderId) {
      return res.status(400).json({ success: false, message: "No order ID" });
    }

    const order = await Order.findOne({ orderId: orderId });
    if (!order) {
      return res
        .status(400)
        .json({ success: false, message: "Order not found" });
    }

    // Checking product quantities synchronously
    for (const item of order.orderedItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res
          .status(400)
          .json({ success: false, message: "Product not found" });
      }
      console.log("here");
      const comboIndex = product.combos.findIndex(
        (combo) =>
          combo.ram === item.RAM &&
          combo.storage === item.Storage &&
          combo.color.includes(item.color)
      );
      console.log("JIOJIOJ");
      if (comboIndex === -1) {
        console.log("No combo found");
        return res
          .status(400)
          .json({ success: false, message: "Invalid product combo" });
      }
      console.log("bygdyugigh");
      if (product.combos[comboIndex].quantity < item.quantity) {
        return res
          .status(400)
          .json({ success: false, message: "Product is out of stock" });
      }
    }

    // Create Razorpay order after checking stock
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.FinalAmount * 100),
      currency: "INR",
      receipt: order._id.toString(),
      payment_capture: 1,
    });

    return res.json({
      success: true,
      message: "Razorpay order created",
      razorpayOrder: razorpayOrder,
      order: order,
      finalAmount: order.FinalAmount,
    });
  } catch (error) {
    console.error(error, "Error in retryPayment");
    res.status(500).json({ error: "Internal server error" });
  }
};

const verifyRetryPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
    } = req.body;

    if (!razorpay_payment_id) {
      console.log("Payment failed, updating order status.");

      return res.status(400).json({
        success: false,
        message: "Payment failed or user canceled",
        order: order.orderId,
      });
    }
    if (!razorpay_payment_id) {
      console.log("Payment failed, updating order status.");

      return res.status(400).json({
        success: false,
        message: "Payment failed or user canceled",
        order: order.orderId,
      });
    }
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(sign.toString())
      .digest("hex");
    const order = await Order.findById(order_id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    if (razorpay_signature === expectedSign) {
      order.paymentStatus = "Confirmed";
      await order.save();
      await updateInventory(order.orderedItems, order.userId);
      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        order: order.orderId,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
        order: order.orderId,
        order: order.orderId,
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying payment",
    });
  }
};

const generateInvoice = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const itemId = req.params.itemId;
    const order = await Order.findOne(
      {
        _id: orderId,
        orderedItems: { $elemMatch: { _id: itemId } },
      },
      { "orderedItems.$": 1, createdAt: 1 }
    );
    console.log(order, "ordersldlk");
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if(order.status !== "Delivered"){
      return res.status(400).json({success:false,message:"Order is still not delivered"})
    }

    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
    });
    const chunks = [];

    // Collect the PDF data
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {
      const pdfData = Buffer.concat(chunks);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice-${orderId}.pdf`
      );
      res.send(pdfData);
    });

    // Define colors
    const primaryColor = "#2563eb"; // Blue
    const secondaryColor = "#64748b"; // Gray
    const accentColor = "#1e293b"; // Dark blue

    // Add shop logo/name at top with modern design
    doc
      .fillColor(primaryColor)
      .fontSize(32)
      .font("Helvetica-Bold")
      .text("PixelPoint", { align: "center" });

    doc
      .fontSize(13)
      .fillColor(accentColor)
      .font("Helvetica-Bold")
      .text("Your all in one shop for premium laptops", { align: "center" });

    // Add a decorative line
    doc.moveDown(0.5);
    const pageWidth = doc.page.width - 100;
    doc
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .strokeColor(primaryColor)
      .lineWidth(2)
      .stroke();

    // Add invoice header
    doc.moveDown(2);
    doc
      .fontSize(20)
      .fillColor(accentColor)
      .font("Helvetica-Bold")
      .text("INVOICE", { align: "left" });

    // Add invoice details in a modern layout
    doc.moveDown(1);
    doc.fontSize(12).font("Helvetica").fillColor(secondaryColor);

    // Create two-column layout for invoice details
    const leftColumn = 50;
    const rightColumn = 350;

    doc.text("Billed To:", leftColumn, doc.y);
    doc.moveDown(0.5);
    doc
      .fillColor(accentColor)
      .text(order.customerName || "Valued Customer", leftColumn, doc.y);

    doc
      .fillColor(secondaryColor)
      .text("Invoice Details:", rightColumn, doc.y - doc.currentLineHeight());
    doc
      .fillColor(accentColor)
      .text(`OrderID #: ${orderId}`, rightColumn)
      .text(
        `Date: ${new Date(order.createdAt).toLocaleDateString()}`,
        rightColumn
      );

    // Add items table with modern styling
    doc.moveDown(2);

    // Table headers with background
    const tableTop = doc.y;
    doc
      .fillColor(primaryColor)
      .rect(50, tableTop, doc.page.width - 100, 30)
      .fill();

    doc.fillColor("#ffffff").fontSize(12).font("Helvetica-Bold");

    // Define column positions
    const itemX = 70;
    const quantityX = 280;
    const priceX = 380;
    const totalX = 480;

    // Add table headers
    doc
      .text("ITEM", itemX, tableTop + 10)
      .text("QTY", quantityX, tableTop + 10)
      .text("PRICE", priceX, tableTop + 10)
      .text("TOTAL", totalX, tableTop + 10);

    // Add table rows
    let rowY = tableTop + 40;
    doc.font("Helvetica").fillColor(accentColor);

    order.orderedItems.forEach((item) => {
      // Zebra striping
      if (((rowY - tableTop) / 30) % 2 === 0) {
        doc
          .fillColor("#f8fafc")
          .rect(50, rowY - 5, doc.page.width - 100, 25)
          .fill();
      }

      doc
        .fillColor(accentColor)
        .text(
          item.productName.length > 25
            ? item.productName.slice(0, 25) + "..."
            : item.productName,
          itemX,
          rowY
        )
        .text(item.quantity.toString(), quantityX, rowY)
        .text(`₹${item.price.toLocaleString("en-IN")}`, priceX, rowY)
        .text(`₹${item.totalPrice.toLocaleString("en-IN")}`, totalX, rowY);

      rowY += 30;
    });

    const requiredSpace = 120;
    const bottomMargin = 50;
    const availableSpace = doc.page.height - doc.y - bottomMargin;
    if (availableSpace < requiredSpace) {
      doc.addPage();
    }

    // Add total section with modern styling
    doc.moveDown(2);
    const totalsX = 350;
    const valuesX = 480;

    // Add a line above totals
    doc
      .moveTo(totalsX, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .strokeColor(secondaryColor)
      .lineWidth(0.5)
      .stroke();

    doc.moveDown(0.5);

    // Subtotal
    doc
      .font("Helvetica")
      .fillColor(secondaryColor)
      .text("Subtotal:", totalsX)
      .font("Helvetica")
      .fillColor(accentColor)
      .text(
        `INR${order.orderedItems[0].totalPrice.toLocaleString("en-IN")}`,
        valuesX,
        doc.y - doc.currentLineHeight(),
        { align: "right" }
      );

    // Discount
    doc
      .moveDown(0.5)
      .font("Helvetica")
      .fillColor(secondaryColor)
      .text("Discount:", totalsX)
      .font("Helvetica")
      .fillColor(accentColor)
      .text(
        `INR${order.orderedItems[0].dicountPrice.toLocaleString("en-IN") || 0}`,
        valuesX,
        doc.y - doc.currentLineHeight(),
        { align: "right" }
      );

    // Final total with background highlight
    doc.moveDown(0.5);
    doc
      .fillColor(primaryColor)
      .rect(totalsX - 10, doc.y - 5, doc.page.width - totalsX - 30, 30)
      .fill();

    doc
      .font("Helvetica-Bold")
      .fillColor("#ffffff")
      .text("TOTAL:", totalsX, doc.y - doc.currentLineHeight() + 8)
      .text(
        `₹${order.orderedItems[0].finalAmount.toLocaleString("en-IN")}`,
        valuesX,
        doc.y - doc.currentLineHeight(),
        { align: "right" }
      );

    const footerHeight = 40;
    const footerY = doc.page.height - bottomMargin - footerHeight;

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor(secondaryColor)
      .text(
        "Thank you for shopping with PixelPoint!\nFor any questions, please contact our support team.",
        50,
        footerY,
        {
          align: "center",
          width: doc.page.width - 100,
        }
      );

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("Error generating invoice:", error);
    res
      .status(500)
      .json({ success: false, message: "Error generating invoice" });
  }
};

module.exports = {
  processCheckout,
  placeOrder,
  orderPlaced,
  orderPending,
  retryPayment,
  verifyRetryPayment,
  generateInvoice,
  verifyPayment,
  orderPending
};
