const mongoose = require("mongoose");
const { Schema } = mongoose;

const SlotsSchema = new Schema(
	{
		slots: { type: Number, required: true },
		walkId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "ScheduledWalk",
			required: true,
		},
		walkerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		marshalId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true }
);
module.exports = mongoose.model("Slots", SlotsSchema);
