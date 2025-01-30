const mongoose = require("mongoose");
const env = require("dotenv").config();

const connectDB = async () => {
  try {
    const clientOptions = {
      serverApi: { version: "1", strict: false, deprecationErrors: true },
    };
    await mongoose.connect(process.env.MONGODB_URI, clientOptions);
    console.log("Database connected");
  } catch (error) {
    console.log("Database connection error", error.message);
    process.exit(1);
  }
};
module.exports = connectDB;
