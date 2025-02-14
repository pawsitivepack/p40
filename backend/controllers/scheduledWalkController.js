const ScheduledWalk = require("../models/walkmodel");
const User = require("../models/usersModel");

exports.addScheduledWalk = async (req, res) => {
	try {
		const { dog, walker, marshal, date, location, status } = req.body;
		console.log("trying to add scheduled walk");
		// Ensure marshal is a user with role "marshal"
		const marshalUser = await User.findById(marshal);
		if (!marshalUser || marshalUser.role !== "marshal") {
			return res
				.status(400)
				.json({ error: "Assigned marshal must have the role of 'marshal'." });
		}

		// Create a new ScheduledWalk
		const newWalk = new ScheduledWalk({
			dog,
			walker,
			marshal,
			date,
			location,
			status,
		});

		// Save the walk
		const savedWalk = await newWalk.save();

		// Populate walker, marshal, and dog fields
		const populatedWalk = await ScheduledWalk.findById(savedWalk._id)
			.populate("walker", "firstName lastName") // Populate walker with firstName and lastName
			.populate("marshal", "firstName lastName") // Populate marshal with firstName and lastName
			.populate("dog", "name breed"); // Populate dog with name and breed

		res.status(201).json({
			message: "Scheduled walk added successfully",
			walk: populatedWalk,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to add scheduled walk" });
	}
};

exports.getAllScheduledWalks = async (req, res) => {
	try {
		const walks = await ScheduledWalk.find()
			.populate("walker", "firstName lastName") // Populate walker with firstName and lastName
			.populate("marshal", "firstName lastName") // Populate marshal with firstName and lastName
			.populate("dog", "name breed"); // Populate dog with name and breed

		res.status(200).json(walks);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to retrieve scheduled walks" });
	}
};
