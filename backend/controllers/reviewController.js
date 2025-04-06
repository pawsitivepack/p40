const Review = require("../models/reviewModel");

// Create a new review for a specific dog
exports.createReviewForDog = async (req, res) => {
	try {
		const { userId, star, review } = req.body;
		const images = req.files?.map((file) => file.path);
		const dogId = req.params.id;

		const newReview = new Review({
			userId,
			star,
			review,
			dogId,
			images,
		});

		await newReview.save();
		res
			.status(201)
			.json({ message: "Review submitted successfully", review: newReview });
	} catch (err) {
		console.error("Error creating review:", err);
		res
			.status(500)
			.json({ message: "Failed to submit review", error: err.message });
	}
};

// Get all reviews for a specific dog
exports.getReviewsForDog = async (req, res) => {
	try {
		const dogId = req.params.id;

		const reviews = await Review.find({ dogId }).populate(
			"userId",
			"firstName lastName picture"
		);
		res.status(200).json(reviews);
	} catch (err) {
		console.error("Error fetching reviews:", err);
		res
			.status(500)
			.json({ message: "Failed to fetch reviews", error: err.message });
	}
};

exports.deleteReview = async (req, res) => {
	try {
		const review = await Review.findById(req.params.reviewId);
		if (!review) {
			return res.status(404).json({ message: "Review not found" });
		}

		await review.deleteOne();
		res.status(200).json({ message: "Review deleted successfully" });
	} catch (err) {
		console.error("Error deleting review:", err);
		res
			.status(500)
			.json({ message: "Failed to delete review", error: err.message });
	}
};

exports.getPhotosForReview = async (req, res) => {
	try {
		const reviews = await Review.find({});
		const imageUrls = reviews.flatMap((review) => review.images || []);
		res.status(200).json(imageUrls);
	} catch (err) {
		console.error("Error fetching all review photos:", err);
		res
			.status(500)
			.json({ message: "Failed to fetch review photos", error: err.message });
	}
};
