const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		dob: { type: Date, required: true },
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
		waiverSigned: { type: Boolean, default: false }, // To check if the user has signed the waiver
		userPoints: { type: Number, default: 0, required: false }, // Default user points
		isAdmin: { type: Boolean, default: false, required: false }, // To identify admin users
		role: {
			type: String,
			enum: ["marshal", "admin", "user"],
			default: "user", // Role defaults to 'user'
		},
		googleAuth: { type: Boolean, default: false },
		lastLogin: { type: Date, required: false },
		isVerified: { type: Boolean, default: false },
		verificationToken: { type: String },
		otp: { type: String, required: false },
		otpExpires: { type: Date, required: false },

		dogsWalked: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "ScheduledWalk",
				required: false,
			},
		], // Reference to Dog model

		completedWalks: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "CompletedWalk",
				required: false,
			},
		],
		bookedWalks: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "BookedWalks",
				required: false,
			},
		], // Reference to Dog model
		picture: { type: String, required: false },
	},
	{ timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
