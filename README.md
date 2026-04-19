🖥️ Pixel Point – Laptop E-Commerce Platform

Pixel Point is a full-stack e-commerce web application for selling new and refurbished laptops, featuring secure authentication, advanced filtering, wallet-based payments, referral rewards, and a powerful admin dashboard.

The project is built with server-side rendering and designed to simulate real-world e-commerce workflows including payments, refunds, offers, analytics, and automation.

🚀 Live Demo

pixelpoint.sharonp.pro

🛠️ Tech Stack

Frontend (SSR):

EJS

HTML, CSS, JavaScript

Backend:

Node.js

Express.js

Database:

MongoDB (Mongoose)

Authentication & Payments:

Google OAuth

Razorpay

Wallet System

Other Tools & Services:

AWS (Hosting)

Cron Jobs

PDF Generation

✨ Key Features
👤 User Features

User authentication (Email/Password + Google OAuth)

Browse new & refurbished laptops

Advanced search & filtering:

Price

Brand

Color

Category

Wishlist & Cart management

Coupon & offer application

Online payments via Razorpay

Wallet system for refunds & balance usage

Referral system with rewards

Order tracking:

View orders

Cancel orders

Return orders

Refunds credited automatically to wallet

Profile & account management

🧑‍💼 Admin Features

Admin dashboard with:

Revenue analytics

Order statistics

Total sales tracking

Downloadable PDF reports with order details

Product, category & brand management

Coupon & offer management:

Product-based offers

Category-based offers

User management:

Block / unblock users

Order lifecycle management:

Pending

Shipped

Delivered

Automated tasks using Cron Jobs:

Expiring offers automatically

Updating order status based on time

🔄 Automation

Scheduled cron jobs handle:

Offer expiration

Order status transitions

Reduces manual admin intervention and ensures system consistency

💳 Payments & Refunds

Secure online payments using Razorpay

Wallet integration for:

Refunds

Partial payments

Automatic wallet credit on order returns or cancellations

🏗️ Installation & Setup
Prerequisites

Node.js

MongoDB

Razorpay account

Google OAuth credentials

Steps
git clone https://github.com/your-username/pixel-point.git
cd pixel-point
npm install
npm start

Server starts using:

npm start

🔐 Environment Variables

Create a .env file and configure:

Server Configuration

PORT= "Your_Port"

Database Configuration

MONGODB_URI= "Your_Connection_String"

Session Secret Key

SESSION_SECRET= "Your_Random_Secret_Key"

Nodemailer Configuration

NODEMAILER_EMAIL= "Your_Nodemailer_Email"
NODEMAILER_PASSWORD= "Your_Nodemailer_Password"

Google OAuth Configuration

GOOGLE_CLIENT_ID= "Your_Google_Client_ID"
GOOGLE_CLIENT_SECRET= "Your_Google_Client_Secret"

Cloudinary Configuration

CLOUDINARY_CLOUD_NAME= "Your_Cloudinary_Cloud_Name"
CLOUDINARY_API_KEY= "Your_Cloudinary_API_Key"
CLOUDINARY_API_SECRET= "Your_Cloudinary_API_Secret"

Razorpay Payment Gateway

RAZORPAY_ID_KEY= "Your_Razorpay_ID"
RAZORPAY_SECRET_KEY= "Your_Razorpay_Secret_Key"

📌 Project Highlights

Server-Side Rendering for SEO & performance

Real-world payment & refund workflows

Wallet-based transaction handling

Scalable admin analytics system

Production-style automation using cron jobs

Deployed on AWS

👩‍💻 Author

Sharon P
Self-taught MERN Developer
