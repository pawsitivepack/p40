const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema(
	{
		star: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
		},
		date: {
			type: Date,
			default: Date.now,
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		dogId: {
			type: Schema.Types.ObjectId,
			ref: "Dog",
			required: true,
		},
		review: {
			type: String,
			required: true,
		},
		images: [
			{
				type: String,
				required: false,
			},
		],
	},
	{ timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
