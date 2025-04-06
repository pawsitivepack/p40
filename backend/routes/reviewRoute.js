const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/verifyAdmin");
const { uploadReviewPic } = require("../config/cloudinary");

router.post(
	"/:id",
	uploadReviewPic.array("images", 5),
	reviewController.createReviewForDog
);
router.get("/photos", reviewController.getPhotosForReview);
router.get("/:id", reviewController.getReviewsForDog);
router.delete("/:reviewId", verifyToken, reviewController.deleteReview);

module.exports = router;
