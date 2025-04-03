const mongoose = require("mongoose");

const restrictedDateSettingSchema = new mongoose.Schema({
	daysClosed: {
		type: [Number], // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
		default: [0, 1], // e.g. Close Sundays & Mondays
	},
	specificDates: {
		type: [Date], // Array of hard-blocked individual dates
		default: [], // Example: [2025-04-01T00:00:00.000Z]
	},
	weeklyHours: {
		type: new mongoose.Schema(
			{
				start: { type: String, default: "10:00" },
				end: { type: String, default: "15:00" },
			},
			{ _id: false }
		),
		default: { start: "10:00", end: "15:00" },
	},
	lastUpdated: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model(
	"RestrictedDateSetting",
	restrictedDateSettingSchema
);
