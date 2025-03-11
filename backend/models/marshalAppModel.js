const mongoose = require("mongoose");
const { Schema } = mongoose;

const marshalAppSchema = new Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		appStatus: {
			type: String,
			enum: ["Pending", "Approved", "Rejected"],
			default: "Pending",
		},
		applicationDate: {
			type: Date,
			default: Date.now,
		},
		message: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);
module.exports = mongoose.model("MarshalApp", marshalAppSchema);
