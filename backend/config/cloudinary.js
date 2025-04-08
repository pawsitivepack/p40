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

// Multer Storage for profile picture Cloudinary
const storage = new CloudinaryStorage({
	cloudinary,
	params: {
		folder: "user_profiles", // Cloudinary folder name
		allowed_formats: ["jpg", "png", "jpeg"],
		public_id: (req, file) => `profile_${Date.now()}`, // Unique image name
	},
});

// Multer Storage for dog picture Cloudinary
const DogPicStorage = new CloudinaryStorage({
	cloudinary,
	params: {
		folder: "dog_pictures", // Cloudinary folder name
		allowed_formats: ["jpg", "png", "jpeg"],
		public_id: (req, file) => `dog_${Date.now()}`, // Unique image name
	},
});
// Multer Storage for dog picture Cloudinary
const ReviewPics = new CloudinaryStorage({
	cloudinary,
	params: {
		folder: "review_pics", // Cloudinary folder name
		allowed_formats: ["jpg", "png", "jpeg"],
		public_id: (req, file) => `dog_${Date.now()}`, // Unique image name
	},
});

const upload = multer({ storage });
const uploadDogPic = multer({ storage: DogPicStorage });
const uploadReviewPic = multer({ storage: ReviewPics });
module.exports = { cloudinary, upload, uploadDogPic, uploadReviewPic };
