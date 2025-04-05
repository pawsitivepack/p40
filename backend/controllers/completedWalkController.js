// const CompletedWalk = require("../models/completedWalkModel");
// const User = require("../models/usersModel");
// const ScheduledWalk = require("../models/walkmodel");
// const Dog = require("../models/dogModel");

// exports.checkInWalker = async (req, res) => {
// 	const { userId, walkId, marshalId, date } = req.body;

// 	try {
// 		// Check if already checked in
// 		const existingEntry = await CompletedWalk.findOne({ userId, walkId });
// 		if (existingEntry) {
// 			return res
// 				.status(400)
// 				.json({ message: "User is already checked in for this walk" });
// 		}

// 		// Create a new CompletedWalk entry
// 		const newCompletedWalk = new CompletedWalk({
// 			userId,
// 			walkId,
// 			marshalId,
// 			date,
// 			status: "pending",
// 		});

// 		await newCompletedWalk.save();
// 		res.status(201).json({
// 			message: "Check-in successful",
// 			completedWalk: newCompletedWalk,
// 		});
// 	} catch (error) {
// 		res.status(500).json({ error: "Error checking in walker" });
// 	}
// };

// exports.walkedADog = async (req, res) => {
// 	const { userId, walkId, dogId } = req.body;

// 	try {
// 		// Find the existing completed walk entry
// 		const completedWalk = await CompletedWalk.findOne({ userId, walkId });

// 		if (!completedWalk) {
// 			return res
// 				.status(404)
// 				.json({ message: "Completed walk entry not found" });
// 		}

// 		// Check if dog is already added (avoid duplicates)
// 		if (completedWalk.dogId.includes(dogId)) {
// 			return res
// 				.status(400)
// 				.json({ message: "This dog has already been walked in this session" });
// 		}

// 		// Add the new dog to the array
// 		completedWalk.dogId.push(dogId);
// 		await completedWalk.save();

// 		await Dog.findByIdAndUpdate(dogId, {
// 			lastWalk: new Date(),
// 			$push: { walks: completedWalk._id },
// 		});

// 		// Count how many dogs have been walked
// 		const completedDogCount = completedWalk.dogId.length;

// 		res.status(200).json({
// 			message: "Dog walk recorded successfully",
// 			completedDogCount,
// 			completedWalk,
// 		});
// 	} catch (error) {
// 		res.status(500).json({ error: "Error updating completed walk entry" });
// 	}
// };

// exports.CompletedUserWalk = async (req, res) => {
// 	const { userId, walkId } = req.body;

// 	try {
// 		// Check if the walk exists and update its status to "completed"
// 		const completedWalk = await CompletedWalk.findOneAndUpdate(
// 			{ userId, walkId },
// 			{ status: "completed" },
// 			{ new: true }
// 		);

// 		if (!completedWalk) {
// 			return res
// 				.status(404)
// 				.json({ message: "Couldn't find the completed walk entry." });
// 		}

// 		// Find the user associated with this walk
// 		const user = await User.findById(userId);

// 		if (!user) {
// 			return res.status(404).json({ message: "User not found." });
// 		}

// 		// Remove the walkId from the user's active walks list
// 		user.dogsWalked = user.dogsWalked.filter((id) => id.toString() !== walkId);

// 		// Store the completed walk ID in the user's completedWalks field
// 		user.completedWalks = user.completedWalks || [];
// 		user.completedWalks.push(completedWalk._id);
// 		user.userPoints = (user.userPoints || 0) + 10;
// 		await user.save();

// 		// Remove the user from the scheduled walk's walker list
// 		const updatedScheduledWalk = await ScheduledWalk.findByIdAndUpdate(
// 			walkId,
// 			{ $pull: { walker: userId } }, // Take them off the walker list
// 			{ new: true }
// 		);

// 		if (!updatedScheduledWalk) {
// 			return res.status(404).json({ message: "Scheduled walk not found." });
// 		}

// 		// Success response
// 		res.status(200).json({
// 			message: "User walk successfully marked as completed!",
// 			completedWalk,
// 			updatedScheduledWalk,
// 		});
// 	} catch (error) {
// 		res.status(500).json({
// 			error: "Something went wrong while completing the walk.",
// 			details: error.message,
// 		});
// 	}
// };

// exports.addManualCompletedWalk = async (req, res) => {
// 	console.log("\n\n\nrequest hit here in thme manual waln\n\n=====\n\n\n");
// 	try {
// 		const { dogId, date } = req.body;

// 		if (!dogId || !date) {
// 			return res.status(400).json({ error: "dogId and date are required." });
// 		}

// 		// Create new completed walk (without userId and marshalId)
// 		const newWalk = await CompletedWalk.create({
// 			dogId: [dogId],
// 			date: new Date(date),
// 			status: "completed",
// 		});

// 		// Optional: Push walk ID to dog's completedWalks array
// 		await Dog.findByIdAndUpdate(dogId, {
// 			lastWalk: new Date(),
// 			$push: { walks: newWalk._id },
// 		});
// 		res
// 			.status(201)
// 			.json({ message: "Walk created successfully", walk: newWalk });
// 	} catch (err) {
// 		console.error("Error creating manual walk:", err);
// 		res.status(500).json({ error: "Internal Server Error" });
// 	}
// };

// exports.DidNotShowUp = async (req, res) => {
// 	const { userId, walkId } = req.body;

// 	try {
// 		// Find the user
// 		const user = await User.findById(userId);
// 		if (!user) {
// 			return res.status(404).json({ message: "User not found." });
// 		}

// 		// Remove the walkId from the user's active walks list
// 		user.dogsWalked = user.dogsWalked.filter((id) => id.toString() !== walkId);

// 		// Deduct 5 points from user's account (ensure it doesn't go negative)
// 		user.points = Math.max((user.userPoints || 0) - 5, 0);
// 		await user.save();

// 		// Remove user from ScheduledWalk's walker list
// 		const updatedScheduledWalk = await ScheduledWalk.findByIdAndUpdate(
// 			walkId,
// 			{ $pull: { walker: userId } }, // Remove userId from walker array
// 			{ new: true }
// 		);

// 		if (!updatedScheduledWalk) {
// 			return res.status(404).json({ message: "Scheduled walk not found." });
// 		}

// 		// Success response
// 		res.status(200).json({
// 			message: "User marked as 'Did Not Show Up'. Walk removed.",
// 			updatedScheduledWalk,
// 			updatedUser: user,
// 		});
// 	} catch (error) {
// 		res.status(500).json({
// 			error: "Something went wrong while marking as 'Did Not Show Up'.",
// 			details: error.message,
// 		});
// 	}
// };

// exports.finishedWalks = async (req, res) => {
// 	try {
// 		// Fetch all completed walks and populate user, dog, and marshal details
// 		const completedWalks = await CompletedWalk.find()
// 			.populate("userId", "firstName lastName") // Get user name
// 			.populate("dogId", "name") // Get dog names
// 			.populate("marshalId", "firstName lastName") // Get marshal name
// 			.populate("walkId"); // Optionally include the full walk details if needed

// 		// Send the populated data back to the client
// 		res.status(200).json(completedWalks);
// 	} catch (error) {
// 		res.status(500).json({
// 			error: "Error fetching completed walks",
// 			details: error.message,
// 		});
// 	}
// };
