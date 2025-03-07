const multer = require("multer");
const path = require("path");
const {CloudinaryStorage} = require("multer-storage-cloudinary")
const cloudinary = require("../config/cloudinary")

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
      folder: 'uploads', 
      format: async (req, file) => 'png', 
      public_id: (req, file) => file.originalname.split('.')[0]
  }
});

module.exports = storage;
