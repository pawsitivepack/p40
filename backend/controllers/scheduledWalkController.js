const ScheduledWalk = require("../models/walkmodel");
const User = require("../models/usersModel");
const { sendWalkConfirmationEmail } = require("../config/mailer");
const { sendNewWalkAnnouncementEmail } = require("../config/mailer");
const BookedWalks = require("../models/BookedModel");
const Notification = require("../models/Notificationmodel");

const mongoose = require("mongoose");

exports.addScheduledWalk = async (req, res) => {
	try {
		const { dog, walker, marshal, date, location, status } = req.body;
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

		const walkWithSameDate = await ScheduledWalk.findOne({
			date: new Date(date),
			location,
		});

		if (walkWithSameDate) {
			if (!walkWithSameDate.marshal.includes(marshal)) {
				walkWithSameDate.slots += 4;
				walkWithSameDate.marshal.push(marshal);
				const updatedWalk = await walkWithSameDate.save();
				const populatedWalk = await ScheduledWalk.findById(updatedWalk._id)
					.populate("walker", "firstName lastName")
					.populate("marshal", "firstName lastName")
					.populate("dog", "name breed");

				return res.status(200).json({
					message: "Existing walk updated with new slots and marshal.",
					walk: populatedWalk,
				});
			} else {
				return res.status(400).json({
					error:
						"This marshal has already scheduled a walk at this date and time.",
				});
			}
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

		// ✅ Send email to all users about new walk
		const allUsers = await User.find({ role: "user" });

		for (const user of allUsers) {
			try {
				await sendNewWalkAnnouncementEmail(user, savedWalk);
			} catch (err) {
				console.error(`❌ Failed to send email to ${user.email}:`, err.message);
			}
		}	
		  
		await Notification.create({
			recipient: null,         // null = broadcast
			role: "user",            // notify all users (not admins/marshals)
			type: "booking",         
			message: `New walk added on ${new Date(newWalk.date).toLocaleDateString()} at ${new Date(newWalk.date).toLocaleTimeString([], {
			  hour: '2-digit',
			  minute: '2-digit'
			})}. Book your slot now!`,
			readStatus: false,
		  });	  
		  

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
	const { walkId, userId, slots } = req.body;
	console.log(req.body);
	try {
		// Find the walk by ID
		const walk = await ScheduledWalk.findById(walkId);

		if (!walk) {
			return res.status(404).json({ message: "Walk not found" });
		}

		// Check if slots are available
		if (walk.slots < slots) {
			return res
				.status(400)
				.json({ message: "Not enough slots available in this walk." });
		}

		// Check if the user is already in the walker list
		if (walk.walker.includes(userId)) {
			return res
				.status(400)
				.json({ message: "You have already confirmed this walk." });
		}

		// Subtract 1 from slots and add userId to the walker array
		walk.slots -= slots;
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
		const booked = await BookedWalks.create({
			slots: slots,
			walkId: walk._id,
			userId: userId,
			marshalId: walk.marshal,
			date: walk.date,
			location: walk.location,
		});

		user.bookedWalks = user.bookedWalks || [];
		user.bookedWalks.push(booked._id);
		await user.save();
		walk.bookedWalk.push(booked._id); // Add the booked walk to the ScheduledWalk
		await walk.save(); // Save the updated ScheduledWalk

		await sendWalkConfirmationEmail(user, walk);

		const marshalIds = Array.isArray(walk.marshal) ? walk.marshal : [walk.marshal];
		for (const marshalId of marshalIds) {
			await Notification.create({
				recipient: marshalId,
				role: "marshal",
				sender: userId,
				type: "booking",			 
				message: `${user.firstName} ${user.lastName} booked ${slots} slot(s) for the walk on ${new Date(walk.date).toLocaleDateString()} at ${new Date(walk.date).toLocaleTimeString([], {
				hour: '2-digit',
				minute: '2-digit'
				})}.`,
				walkId: walk._id,
				readStatus: false,
			});
		}
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
		const booked = await BookedWalks.findById(walkId);
		console.log("Fetched walk:", booked);
		const slot = booked.slots;
		console.log("Slots to be added back:", slot);
		if (!booked) {
			return res.status(404).json({ message: "Walk not found" });
		}
        const user = await User.findById(userId);
		if (!user) {
		return res.status(404).json({ message: "User not found" });
		}

		// Check if the user is allowed to cancel the walk
		if (userRole === "user" && booked.userId.toString() !== userId) {
			return res
				.status(403)
				.json({ message: "You are not part of this walk." });
		}

		const walk = await ScheduledWalk.findById(booked.walkId);
		if (!walk) {
			return res.status(404).json({ message: "Scheduled walk not found" });
		}

		// Remove the walk from the user's dogsWalked array
		await User.findByIdAndUpdate(userId, {
			$pull: { dogsWalked: booked.walkId, bookedWalks: booked._id }, // Remove the walkId and bookedWalk reference
		});

		// Remove the walker from the scheduled walk and update slots
		await ScheduledWalk.findByIdAndUpdate(booked.walkId, {
			$pull: {
				walker: userId,
				bookedWalk: booked._id,
			},
			$inc: { slots: slot },
		});
		// Optionally remove the BookedWalk entry
		await BookedWalks.findByIdAndDelete(walkId);

		const marshalIds = Array.isArray(walk.marshal) ? walk.marshal : [walk.marshal];
		for (const marshalId of marshalIds) {
			await Notification.create({
				recipient: marshalId,
				role: "marshal",
				sender: userId,
				type: "booking", 
				message: `${user.firstName} ${user.lastName} cancelled ${slot} slot(s) for the walk on ${new Date(booked.date).toLocaleDateString()} at ${new Date(booked.date).toLocaleTimeString([], {
				hour: '2-digit',
				minute: '2-digit'
				})}.`,
				walkId: booked.walkId,
				readStatus: false,
			});
		}
		return res
			.status(200)
			.json({ message: "Walk cancelled and references removed." });
	} catch (error) {
		console.error("Error cancelling walk:", error);
		res.status(500).json({ message: "Failed to cancel the walk." });
	}
};

exports.checkInScheduledWalks = async (req, res) => {
	try {
		const now = new Date();
		const tomorrow = new Date();
		tomorrow.setDate(now.getDate() + 1);
		tomorrow.setHours(0, 0, 0, 0);

		const dayAfterTomorrow = new Date();
		dayAfterTomorrow.setDate(now.getDate() + 2);
		dayAfterTomorrow.setHours(0, 0, 0, 0);

		const walks = await ScheduledWalk.find({
			date: { $lt: dayAfterTomorrow },
		})
			.populate("walker", "firstName lastName picture")
			.populate("marshal", "firstName lastName")
			.populate("dog", "name breed");

		const completedWalks = await BookedWalks.find({
			status: "walking",
		})
			.populate("userId", "firstName lastName picture")
			.populate("dogs", "name breed demeanor imageURL");

		console.log("Retrieved completed walks for check-in:", completedWalks);
		res.status(200).json({ data: { walks, completedWalks } });
	} catch (error) {
		console.error("Error retrieving scheduled walks:", error);
		res.status(500).json({ error: "Failed to retrieve scheduled walks" });
	}
};
// DELETE /scheduledWalks/:id
exports.cancelSingleWalk = async (req, res) => {
	try {
		const walkId = req.params.id;

		// Delete the walk
		const deletedWalk = await ScheduledWalk.findByIdAndDelete(walkId);
		if (!deletedWalk) {
			return res.status(404).json({ message: "Walk not found." });
		}

		// Find all related booked walks
		const bookedWalks = await BookedWalks.find({ walkId });

		// Extract bookedWalk IDs
		const bookedWalkIds = bookedWalks.map((bw) => bw._id);

		// Remove bookedWalks from users' profiles
		await User.updateMany(
			{ bookedWalks: { $in: bookedWalkIds } },
			{ $pull: { bookedWalks: { $in: bookedWalkIds } } }
		);

		// Delete booked walk entries
		await BookedWalks.deleteMany({ _id: { $in: bookedWalkIds } });

		res
			.status(200)
			.json({ message: "Walk and related bookings canceled successfully." });
	} catch (error) {
		console.error("Error cancelling walk:", error);
		res.status(500).json({ message: "Failed to cancel walk." });
	}
};

// DELETE /scheduledWalks/cancel-day/:date
exports.cancelWalksForDay = async (req, res) => {
	try {
		const { date } = req.params;

		const startOfDay = new Date(`${date}T00:00:00`);
		const endOfDay = new Date(`${date}T23:59:59.999`);

		const walksToDelete = await ScheduledWalk.find({
			date: { $gte: startOfDay, $lte: endOfDay },
		});

		const walkIds = walksToDelete.map((walk) => walk._id);

		// Find all related booked walks
		const bookedWalks = await BookedWalks.find({ walkId: { $in: walkIds } });
		const bookedWalkIds = bookedWalks.map((bw) => bw._id);

		// Remove bookedWalks from users' profiles
		await User.updateMany(
			{ bookedWalks: { $in: bookedWalkIds } },
			{ $pull: { bookedWalks: { $in: bookedWalkIds } } }
		);

		// Delete booked walk entries
		await BookedWalks.deleteMany({ _id: { $in: bookedWalkIds } });

		// Delete the scheduled walks
		const result = await ScheduledWalk.deleteMany({ _id: { $in: walkIds } });

		res.status(200).json({
			message: `${result.deletedCount} walks and related bookings canceled for ${date}`,
		});
	} catch (error) {
		console.error("Error cancelling walks for day:", error);
		res.status(500).json({ message: "Failed to cancel walks for day." });
	}
};
