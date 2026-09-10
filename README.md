# PixelPoint 🛒

A full-stack e-commerce platform for buying new and refurbished laptops, built with Node.js, Express.js, MongoDB, and EJS.

PixelPoint simulates real-world e-commerce workflows including authentication, payments, refunds, wallet transactions, referral rewards, inventory management, order management, admin analytics, and scheduled automation.

## 🚀 Live Demo

[PixelPoint](https://pixelpoint.sharonp.pro)

## 📸 Screenshots

### User Side

#### Homepage

<img width="1200" alt="PixelPoint Homepage" src="https://github.com/user-attachments/assets/1ce84fe6-0e45-488a-a516-f2d020676fee" />

#### Product Browsing

<img width="1200" alt="PixelPoint Shop" src="https://github.com/user-attachments/assets/fc359252-b8be-4195-98d4-096ca2817a2f" />

#### Cart & Checkout

<img width="1200" alt="PixelPoint Cart" src="https://github.com/user-attachments/assets/b47ea218-87db-4afa-95be-23c8c5192945" />

<img width="1200" alt="PixelPoint Checkout" src="https://github.com/user-attachments/assets/5439f36c-5205-4783-aeab-198a3cde7cb0" />

### Admin Side

#### Dashboard & Analytics

<img width="1200" alt="PixelPoint Admin Dashboard" src="https://github.com/user-attachments/assets/958aa973-89be-4294-a463-fbdbc0762132" />

#### Product Management

<img width="1200" alt="productmanagement" src="https://github.com/user-attachments/assets/f6c8f8d2-761e-46db-b702-2cfd2093a55e" />

#### Order Management

<img width="1200" alt="PixelPoint Order Management" src="https://github.com/user-attachments/assets/316641c3-2357-484b-8d5f-f2cbaab80db6" />

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

Payment workflows also handle payment failures and recovery scenarios.

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

## 🏗️ Architecture

```text
                         User
                           │
                           ▼
                  EJS / Server-Side Rendering
                           │
                           ▼
                      Express.js
                           │
                           ▼
                    Application Logic
                           │
                           ▼
                    MongoDB / Mongoose
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        Google OAuth    Razorpay    Cloudinary
