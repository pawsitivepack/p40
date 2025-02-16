const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		age: { type: Number, required: false },
		phone: { type: String }, // Not required now
		email: {
			type: String,
			required: true,
			unique: true,
			caseInsensitive: true,
		},
		password: {
			type: String,
			required: function () {
				return !this.googleAuth;
			},
		},
		userPoints: { type: Number, default: 0, required: false }, // Default user points
		isAdmin: { type: Boolean, default: false, required: false }, // To identify admin users
		role: {
			type: String,
			enum: ["marshal", "admin", "user"],
			default: "user", // Role defaults to 'user'
		},
		googleAuth: { type: Boolean, default: false },
		dogsWalked: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "ScheduledWalk",
				required: false,
			},
		], // Reference to Dog model
	},
	{ timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
