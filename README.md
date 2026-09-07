# PixelPoint 🛒

A full-stack e-commerce platform for buying new and refurbished laptops, built with Node.js, Express.js, MongoDB, and EJS.

PixelPoint simulates real-world e-commerce workflows including authentication, payments, refunds, wallet transactions, referral rewards, inventory management, order management, admin analytics, and scheduled automation.

## 🚀 Live Demo

[PixelPoint](https://pixelpoint.sharonp.pro)

## ✨ Features

### User Features

- Email/password authentication
- Google OAuth authentication
- OTP-based verification
- Browse new and refurbished laptops
- Advanced product search and filtering
- Filter by price, brand, color, and category
- Product variants
- Cart and wishlist management
- Coupon and offer application
- Razorpay online payments
- Wallet for refunds and balance usage
- Referral system with rewards
- Order tracking and management
- Order cancellation and return requests
- Automatic refund processing through wallet credits
- Profile and account management

### Admin Features

- Admin dashboard with revenue and sales analytics
- Order statistics and sales tracking
- Product management
- Category and brand management
- Coupon management
- Product-based and category-based offers
- User management with block/unblock functionality
- Order lifecycle management
- Downloadable PDF sales reports

## 💳 Payments & Wallet

PixelPoint integrates Razorpay for online payments along with a custom wallet system for handling refunds and account balance.

The wallet supports:

- Refund credits
- Partial payment usage
- Automatic wallet credit for eligible returns and cancellations

## ⚙️ Automation

Scheduled Cron Jobs handle time-dependent business operations such as:

- Automatic offer expiration
- Time-based order status updates
- Other scheduled business rules

This reduces manual administration and keeps recurring workflows consistent.

## 📊 Analytics & Reporting

The admin dashboard provides insights into the application's business activity, including:

- Revenue analytics
- Total sales
- Order statistics
- Sales reports
- Product management
- PDF report generation

MongoDB aggregation pipelines are used for reporting and analytics-related operations.

## 🛠️ Tech Stack

### Frontend

- EJS
- HTML
- CSS
- JavaScript
- Bootstrap

### Backend

- Node.js
- Express.js

### Database

- MongoDB
- Mongoose

### Authentication

- Express Sessions
- Google OAuth
- OTP Verification

### Payments

- Razorpay
- Custom Wallet System

### Cloud & Tools

- Cloudinary
- AWS
- Cron Jobs
- PDF Generation

## 🏗️ Architecture

```text
User
  ↓
EJS / Server-Side Rendering
  ↓
Express.js
  ↓
Application Logic
  ↓
MongoDB / Mongoose
