const mongoose = require("mongoose");

const scheduledWalkSchema = new mongoose.Schema(
	{
		dog: [
			{ type: mongoose.Schema.Types.ObjectId, ref: "Dog", required: false },
		],
		bookedWalk: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "BookedWalks",
				required: false,
			},
		],
		walker: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				required: false,
			},
		],
		marshal: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				required: true,
			},
		],
		date: { type: Date, required: true },
		location: { type: String, required: true, default: "920 Freight Drive" }, // Location of the walk
		status: {
			type: String,
			enum: ["Scheduled", "Completed", "Cancelled"],
			default: "Scheduled",
		},
		slots: { type: Number, default: 4 }, // Number of slots available for the walk
		duration: { type: String, default: "1 hour" }, // Duration of the walk
		images: [{ type: String }], // Array to store image URLs
	},
	{ timestamps: true }
);

const ScheduledWalk = mongoose.model("ScheduledWalk", scheduledWalkSchema);
module.exports = ScheduledWalk;
