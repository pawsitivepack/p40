const mongoose = require("mongoose");
const { Schema } = mongoose;

const SlotsSchema = new Schema(
	{
		slots: { type: Number, required: true, default: 1 },
		walkId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "ScheduledWalk",
			required: false,
		},
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		marshalId: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
		dogs: [
			{ type: mongoose.Schema.Types.ObjectId, ref: "Dog", required: false },
		],
		date: { type: Date, Default: Date.now },
		status: {
			type: String,
			enum: ["booked", "walking", "completed", "did not show"],
			default: "booked",
		},
		location: { type: String, required: false }, // Optional field to store location of the walk
	},
	{ timestamps: true }
);
module.exports = mongoose.model("BookedWalks", SlotsSchema);
