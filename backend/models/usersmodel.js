const walkerSchema = new Schema(
	{
		name: { type: String, required: true },
		experience: { type: Number, min: 0, max: 10 }, // Experience in years
		availability: [{ type: Date }], // Dates and times when the walker is available
		profilePicture: { type: String }, // URL of the walker’s profile picture
		bio: { type: String }, // Additional information about the walker
		contactInfo: {
			email: { type: String, required: true },
			phone: { type: String },
		},
	},
	{ timestamps: true }
);

const Walker = mongoose.model("Walker", walkerSchema);
module.exports = Walker;
