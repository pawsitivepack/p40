const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/verifyAdmin");

router.post("/:id", reviewController.createReviewForDog);
router.get("/:id", reviewController.getReviewsForDog);
router.delete("/:reviewId", verifyToken, reviewController.deleteReview);

module.exports = router;
