const RestrictedDateSetting = require("../models/dateSettingsModel");

// Get the current restriction settings
exports.getDateSettings = async (req, res) => {
	try {
		let settings = await RestrictedDateSetting.findOne();
		if (!settings) {
			settings = new RestrictedDateSetting({
				daysClosed: [0, 1],
				specificDates: [],
				weeklyHours: { start: "10:00", end: "15:00" },
				lastUpdated: Date.now(),
			});
			await settings.save();
		}
		res.status(200).json(settings);
	} catch (error) {
		res.status(500).json({ error: "Server error while fetching settings." });
	}
};

// Update or create restriction settings
exports.updateDateSettings = async (req, res) => {
	console.log("UPDATE SETTINGS ROUTE HIT");
	console.log("Incoming body:", req.body);

	try {
		console.log("================");
		const { daysClosed, specificDates, weeklyHours } = req.body;
		console.log("Parsed daysClosed:", daysClosed);
		console.log("Parsed specificDates:", specificDates);
		console.log("Parsed weeklyHours:", weeklyHours);

		let settings = await RestrictedDateSetting.findOne();
		console.log("Settings after findOne:", settings || "NO SETTINGS FOUND");
		if (!settings) {
			console.log("creating a new setting...");
			settings = new RestrictedDateSetting({
				daysClosed,
				specificDates,
				weeklyHours:
					weeklyHours && Object.keys(weeklyHours).length
						? weeklyHours
						: { start: "10:00", end: "15:00" },
			});
		} else {
			if (daysClosed !== undefined) settings.daysClosed = daysClosed;
			if (specificDates !== undefined) settings.specificDates = specificDates;
			if (weeklyHours !== undefined) {
				settings.weeklyHours = weeklyHours;
			}
			settings.lastUpdated = Date.now();
		}

		console.log("Final settings to save:", settings);
		await settings.save();
		res.status(200).json(settings);
	} catch (error) {
		console.error("Error updating settings:", error);
		res.status(500).json({
			error: "Server error while updating settings: " + error.message,
		});
	}
};
