const User = require("../../models/userSchema");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Products = require("../../models/productSchema");
const Order = require("../../models/orderSchema");
const moment = require("moment");
const PDFDocument = require("pdfkit");
const Excel = require('exceljs');

//function to load login page
const loadlogin = async (req, res) => {
  if (req.session.admin) {
    res.redirect("/admin");
  } else {
    res.render("adminLoginPage");
  }
};

//function to verify login details
const loginverification = async (req, res) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;
    const admin = await User.findOne({ email, isAdmin: true });
    if (admin) {
      const passwordMatch = await bcrypt.compare(password, admin.password);
      if (passwordMatch) {
        req.session.admin = admin;
        return res.redirect("/admin");
      } else {
        return res.render("adminLoginPage", {
          message: "Invalid Username or Password",
        });
      }
    } else {
      return res.render("adminLoginPage", {
        message: "Invalid Username or Password",
      });
    }
  } catch (error) {
    console.log(error);
    res.redirect("/page-not-found");
  }
};

//function to load dashboard
const loaddashboard = async (req, res) => {
  try {
    // Get total counts
    const totalProducts = await Products.countDocuments();
    const totalUsers = await User.countDocuments();
    
    // Get all orders
    const orders = await Order.find();
    
    // Count total active items across all orders (excluding cancelled and returned)
    const totalOrderedItems = orders.reduce((total, order) => {
      const activeItems = order.orderedItems.filter(
        item => !['Cancelled', 'Returned'].includes(item.status)
      );
      return total + activeItems.length;
    }, 0);

    // Calculate total revenue (excluding cancelled and returned items)
    const totalRevenue = orders.reduce((acc, order) => {
      const activeItemsRevenue = order.orderedItems.reduce((itemAcc, item) => {
        if (!['Cancelled', 'Returned'].includes(item.status)) {
          return itemAcc + (item.totalPrice || 0);
        }
        return itemAcc;
      }, 0);
      return acc + activeItemsRevenue;
    }, 0);

    // Get daily orders for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      return moment().subtract(i, 'days').format('YYYY-MM-DD');
    }).reverse();

    const dailyOrders = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: moment().subtract(6, 'days').startOf('day').toDate()
          }
        }
      },
      {
        $unwind: "$orderedItems"  // Unwind the orderedItems array
      },
      {
        $match: {
          "orderedItems.status": { $nin: ['Cancelled', 'Returned'] }  // Filter out cancelled and returned items
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },  // This now counts active individual items
          revenue: { $sum: "$orderedItems.totalPrice" }  // Use item price instead of order total
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format data for charts
    const orderData = last7Days.map(date => {
      const dayData = dailyOrders.find(d => d._id === date);
      return dayData ? dayData.count : 0;
    });

    const revenueData = last7Days.map(date => {
      const dayData = dailyOrders.find(d => d._id === date);
      return dayData ? dayData.revenue : 0;
    });

    // Get recent orders (excluding cancelled and returned items)
    const recentOrders = await Order.aggregate([
      {
        $unwind: "$orderedItems"
      },
      {
        $match: {
          "orderedItems.status": { $nin: ['Cancelled', 'Returned'] }
        }
      },
      {
        $group: {
          _id: "$_id",
          orderId: { $first: "$orderId" },
          userId: { $first: "$userId" },
          createdAt: { $first: "$createdAt" },
          items: { $push: "$orderedItems" },
          totalAmount: { $sum: "$orderedItems.totalPrice" }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Populate user details for recent orders
    await Order.populate(recentOrders, { path: "userId", select: "name" });

    const formattedRecentOrders = recentOrders.map(order => ({
      orderId: order.orderId,
      customerName: order.userId.name,
      productName: order.items[0]?.productName || 'Multiple Products',
      amount: order.totalAmount,
      status: order.items[0]?.status || 'Processing',
      date: moment(order.createdAt).format('MMM DD, YYYY')
    }));

    res.render("admindash", {
      totalProducts,
      users: totalUsers,
      totalOrders: totalOrderedItems,  // Shows only active items count
      totalRevenue,  // Shows revenue from active items only
      chartData: {
        labels: last7Days.map(date => moment(date).format('MMM DD')),
        orderData,
        revenueData
      },
      recentOrders: formattedRecentOrders
    });
  } catch (error) {
    console.log(error);
    res.redirect("/page-not-found");
  }
};

//function for loggingout admin page
const logout = async (req, res) => {
  try {
    req.session.admin = null;
    req.session.save((err) => {
      if (err) {
        console.log("Error saving session:", err);
        return res.redirect("/page-not-found");
      }
      res.redirect("/admin/login");
    });
  } catch (error) {
    console.log("Error at logout:", error);
    res.redirect("/page-not-found");
  }
};

// Generate Sales Report PDF
const generateSalesReport = async (res, orders, reportType, startDate, endDate) => {
  const doc = new PDFDocument();
  const fileName = `sales-report-${reportType}-${moment().format('YYYY-MM-DD')}.pdf`;

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

  // Pipe the PDF directly to the response
  doc.pipe(res);

  // Add header
  doc.fontSize(20).text('Pixel-Point Sales Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`, { align: 'center' });
  doc.fontSize(12).text(`Generated on: ${moment().format('MMMM D, YYYY')}`, { align: 'center' });
  if (startDate && endDate) {
    doc.fontSize(12).text(`Period: ${moment(startDate).format('MMMM D, YYYY')} - ${moment(endDate).format('MMMM D, YYYY')}`, { align: 'center' });
  }
  doc.moveDown();

  // Add summary
  const totalAmount = orders.reduce((sum, order) => sum + order.FinalAmount, 0);
  const totalOrders = orders.length;
  
  doc.fontSize(14).text('Summary', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12).text(`Total Orders: ${totalOrders}`);
  doc.fontSize(12).text(`Total Revenue: ₹${totalAmount.toLocaleString('en-IN')}`);
  doc.moveDown();

  // Add orders table
  doc.fontSize(14).text('Order Details', { underline: true });
  doc.moveDown(0.5);

  // Table headers
  const startX = 50;
  let currentY = doc.y;
  
  doc.fontSize(10);
  doc.text('Order ID', startX, currentY);
  doc.text('Date', startX + 100, currentY);
  doc.text('Customer', startX + 200, currentY);
  doc.text('Status', startX + 300, currentY);
  doc.text('Amount', startX + 400, currentY);
  
  doc.moveDown();
  currentY = doc.y;

  // Draw header line
  doc.moveTo(startX, currentY).lineTo(startX + 470, currentY).stroke();
  doc.moveDown();

  // Table rows
  orders.forEach(order => {
    currentY = doc.y;
    
    if (currentY > 700) { // Start new page if near bottom
      doc.addPage();
      currentY = doc.y;
    }

    doc.fontSize(9);
    doc.text(order.orderId, startX, currentY);
    doc.text(moment(order.createdAt).format('DD/MM/YYYY'), startX + 100, currentY);
    doc.text(order.userId.name, startX + 200, currentY);
    doc.text(order.orderedItems[0]?.status || 'Processing', startX + 300, currentY);
    doc.text(`₹${order.FinalAmount.toLocaleString('en-IN')}`, startX + 400, currentY);
    
    doc.moveDown();
  });

  // Finalize PDF
  doc.end();
};

// Generate Excel Report
const generateExcelReport = async (res, orders, reportType, startDate, endDate) => {
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('Sales Report');

  // Add title
  worksheet.mergeCells('A1:E1');
  worksheet.getCell('A1').value = 'Pixel-Point Sales Report';
  worksheet.getCell('A1').font = { size: 16, bold: true };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };

  // Add report info
  worksheet.mergeCells('A2:E2');
  worksheet.getCell('A2').value = `Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`;
  worksheet.getCell('A2').font = { size: 12 };
  worksheet.getCell('A2').alignment = { horizontal: 'center' };

  worksheet.mergeCells('A3:E3');
  worksheet.getCell('A3').value = `Generated on: ${moment().format('MMMM D, YYYY')}`;
  worksheet.getCell('A3').font = { size: 12 };
  worksheet.getCell('A3').alignment = { horizontal: 'center' };

  if (startDate && endDate) {
    worksheet.mergeCells('A4:E4');
    worksheet.getCell('A4').value = `Period: ${moment(startDate).format('MMMM D, YYYY')} - ${moment(endDate).format('MMMM D, YYYY')}`;
    worksheet.getCell('A4').font = { size: 12 };
    worksheet.getCell('A4').alignment = { horizontal: 'center' };
  }

  // Add summary
  const totalAmount = orders.reduce((sum, order) => sum + order.FinalAmount, 0);
  const totalOrders = orders.length;

  worksheet.mergeCells('A6:E6');
  worksheet.getCell('A6').value = 'Summary';
  worksheet.getCell('A6').font = { size: 14, bold: true };

  worksheet.mergeCells('A7:B7');
  worksheet.getCell('A7').value = `Total Orders: ${totalOrders}`;
  worksheet.getCell('A7').font = { size: 12 };

  worksheet.mergeCells('A8:B8');
  worksheet.getCell('A8').value = `Total Revenue: ₹${totalAmount.toLocaleString('en-IN')}`;
  worksheet.getCell('A8').font = { size: 12 };

  // Add orders table
  worksheet.mergeCells('A10:E10');
  worksheet.getCell('A10').value = 'Order Details';
  worksheet.getCell('A10').font = { size: 14, bold: true };

  // Add headers
  const headers = ['Order ID', 'Date', 'Customer', 'Status', 'Amount'];
  worksheet.getRow(12).values = headers;
  worksheet.getRow(12).font = { bold: true };

  // Style the header row
  worksheet.getRow(12).eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Add data
  let rowIndex = 13;
  orders.forEach(order => {
    worksheet.getRow(rowIndex).values = [
      order.orderId,
      moment(order.createdAt).format('DD/MM/YYYY'),
      order.userId.name,
      order.orderedItems[0]?.status || 'Processing',
      order.FinalAmount
    ];

    // Style amount as currency
    worksheet.getCell(`E${rowIndex}`).numFmt = '₹#,##0.00';

    // Add borders to cells
    worksheet.getRow(rowIndex).eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    rowIndex++;
  });

  // Set column widths
  worksheet.columns.forEach((column) => {
    column.width = 20;
  });

  // Set response headers
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=sales-report-${reportType}-${moment().format('YYYY-MM-DD')}.xlsx`);

  // Write to response
  await workbook.xlsx.write(res);
};

// Sales Report Controller Functions
const generateDailyReport = async (req, res) => {
  try {
    const today = moment().startOf('day');
    const orders = await Order.find({
      createdAt: {
        $gte: today.toDate(),
        $lte: moment().endOf('day').toDate()
      }
    }).populate('userId', 'name');

    if (req.query.format === 'excel') {
      await generateExcelReport(res, orders, 'daily');
    } else {
      await generateSalesReport(res, orders, 'daily');
    }
  } catch (error) {
    console.error('Error generating daily report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

const generateWeeklyReport = async (req, res) => {
  try {
    const startOfWeek = moment().startOf('week');
    const orders = await Order.find({
      createdAt: {
        $gte: startOfWeek.toDate(),
        $lte: moment().endOf('week').toDate()
      }
    }).populate('userId', 'name');

    if (req.query.format === 'excel') {
      await generateExcelReport(res, orders, 'weekly');
    } else {
      await generateSalesReport(res, orders, 'weekly');
    }
  } catch (error) {
    console.error('Error generating weekly report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

const generateYearlyReport = async (req, res) => {
  try {
    const startOfYear = moment().startOf('year');
    const orders = await Order.find({
      createdAt: {
        $gte: startOfYear.toDate(),
        $lte: moment().endOf('year').toDate()
      }
    }).populate('userId', 'name');

    if (req.query.format === 'excel') {
      await generateExcelReport(res, orders, 'yearly');
    } else {
      await generateSalesReport(res, orders, 'yearly');
    }
  } catch (error) {
    console.error('Error generating yearly report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

const generateCustomReport = async (req, res) => {
  try {
    const { start, end } = req.query;
    const startDate = moment(start).startOf('day');
    const endDate = moment(end).endOf('day');

    const orders = await Order.find({
      createdAt: {
        $gte: startDate.toDate(),
        $lte: endDate.toDate()
      }
    }).populate('userId', 'name');

    if (req.query.format === 'excel') {
      await generateExcelReport(res, orders, 'custom', startDate, endDate);
    } else {
      await generateSalesReport(res, orders, 'custom', startDate, endDate);
    }
  } catch (error) {
    console.error('Error generating custom report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

module.exports = {
  loadlogin,
  loginverification,
  loaddashboard,
  logout,
  generateDailyReport,
  generateWeeklyReport,
  generateYearlyReport,
  generateCustomReport
};
