const mongoose = require("mongoose");

const scheduledWalkSchema = new mongoose.Schema(
	{
		dog: { type: mongoose.Schema.Types.ObjectId, ref: "Dog", required: true },
		walker: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: false,
		},
		marshal: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		date: { type: Date, required: true },
		location: { type: String, required: true, default: "monroe" }, // Location of the walk
		status: {
			type: String,
			enum: ["Scheduled", "Completed", "Cancelled"],
			default: "Scheduled",
		},
	},
	{ timestamps: true }
);

const ScheduledWalk = mongoose.model("ScheduledWalk", scheduledWalkSchema);
module.exports = ScheduledWalk;
