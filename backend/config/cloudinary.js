// backend/config/cloudinary.js

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require("dotenv").config();

// Cloudinary Configuration
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
	cloudinary,
	params: {
		folder: "user_profiles", // Cloudinary folder name
		allowed_formats: ["jpg", "png", "jpeg"],
		public_id: (req, file) => `profile_${Date.now()}`, // Unique image name
	},
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };
