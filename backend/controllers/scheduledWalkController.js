const ScheduledWalk = require("../models/walkmodel");
const User = require("../models/usersModel");
const transporter = require("../config/mailer");
const CompletedWalk = require("../models/completedWalkModel");
const Slots = require("../models/slotsModel");

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

		// Check for duplicate walk
		const existingWalk = await ScheduledWalk.findOne({
			marshal,
			date: new Date(date),
		});

		if (existingWalk) {
			return res.status(400).json({
				error: "This walk already exists.",
			});
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
		res.status(500).json({ error: "Failed to add scheduled walk" });
	}
};

exports.getAllScheduledWalks = async (req, res) => {
	try {
		const walks = await ScheduledWalk.find()
			.populate("walker", "firstName lastName picture") // Populate walker with firstName and lastName
			.populate("marshal", "firstName lastName") // Populate marshal with firstName and lastName
			.populate("dog", "name breed"); // Populate dog with name and breed

		res.status(200).json(walks);
	} catch (error) {
		res.status(500).json({ error: "Failed to retrieve scheduled walks" });
	}
};
exports.getMyScheduledWalks = async (req, res) => {
	const userId = req.user.id;

	try {
		const walks = await ScheduledWalk.find({ walker: userId })
			.populate("walker", "firstName lastName") // Populate walker with firstName and lastName
			.populate("marshal", "firstName lastName") // Populate marshal with firstName and lastName
			.populate("dog", "name breed"); // Populate dog with name and breed

		res.status(200).json(walks);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to retrieve scheduled walks" });
	}
};

exports.confirm = async (req, res) => {
	const { walkId, userId } = req.body;

	try {
		// Find the walk by ID
		const walk = await ScheduledWalk.findById(walkId);

		if (!walk) {
			return res.status(404).json({ message: "Walk not found" });
		}

		// Check if slots are available
		if (walk.slots <= 0) {
			return res
				.status(400)
				.json({ message: "No slots available for this walk." });
		}

		// Check if the user is already in the walker list
		if (walk.walker.includes(userId)) {
			return res
				.status(400)
				.json({ message: "You have already confirmed this walk." });
		}

		// Subtract 1 from slots and add userId to the walker array
		walk.slots -= 1;
		walk.walker.push(userId);

		// Save the updated walk
		await walk.save();

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		user.dogsWalked.push(walkId); // Push walkId to the dogsWalked array
		await user.save();

		// Create a new Slots entry
		await Slots.create({
			slots: walk.slots,
			walkId: walk._id,
			walkerId: userId,
			marshalId: walk.marshal,
		});

		await transporter.sendMail({
			from: `"Underdogs Team" <${process.env.EMAIL_USER}>`,
			to: user.email,
			subject: "Walk Confirmation - Underdogs",
			html: `
	<h2>Hi ${user.firstName},</h2>
	<p>You have successfully confirmed your participation in a walk scheduled for <strong>${walk.date.toLocaleString()}</strong> at <strong>${
				walk.location
			}</strong>.</p>
	<p>Thank you for supporting the Underdogs program!</p>
	<p><a href="https://p40-positive.vercel.app//mywalks" target="_blank">See all your walks here</a></p>
`,
		});

		res.status(200).json({ message: "Walk confirmed successfully", walk });
	} catch (error) {
		console.error("Error confirming walk:", error);
		res.status(500).json({ message: "Failed to confirm the walk" });
	}
};

exports.cancelWalk = async (req, res) => {
	try {
		const { walkId } = req.params;
		const userId = req.user.id;
		const userRole = req.user.role;

		// Fetch the walk
		const walk = await ScheduledWalk.findById(walkId);
		if (!walk) {
			return res.status(404).json({ message: "Walk not found" });
		}

		// Check if the user is allowed to cancel the walk
		if (userRole === "user" && !walk.walker.includes(userId)) {
			return res
				.status(403)
				.json({ message: "You are not part of this walk." });
		}

		// Remove the user from the walker array and increase available slots
		walk.walker = walk.walker.filter((id) => !id.equals(userId));
		walk.slots += 1;

		// Remove the walk from the user's dogsWalked array
		await User.findByIdAndUpdate(userId, {
			$pull: { dogsWalked: walkId },
		});

		// Save the walk
		await walk.save();

		return res
			.status(200)
			.json({ message: "Walk cancelled and references removed." });
	} catch (error) {
		console.error("Error cancelling walk:", error);
		res.status(500).json({ message: "Failed to cancel the walk." });
	}
};

exports.checkInScheduledWalks = async (req, res) => {
	console.log("THE REQUEST HIT HERE");
	try {
		const walks = await ScheduledWalk.find()
			.populate("walker", "firstName lastName picture") // Populate walker with firstName and lastName
			.populate("marshal", "firstName lastName") // Populate marshal with firstName and lastName
			.populate("dog", "name breed"); // Populate dog with name and breed

		const completedWalks = await CompletedWalk.find({
			status: "pending",
		})
			.populate("userId", "firstName lastName picture dogs")
			.populate("dogId", "name breed demeanor imageURL");
		// return res.end("HELLO FROM SCHEDULED WALKS");
		res.status(200).json({ data: { walks, completedWalks } });
	} catch (error) {
		res.status(500).json({ error: "Failed to retrieve scheduled walks" });
	}
};
