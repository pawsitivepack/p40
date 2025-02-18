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

        // Convert walker IDs to string for proper comparison
        const walkerIds = walk.walker.map((w) => w.toString());

        // If the user is not in the walker list, return unauthorized error
        if (userRole === "user" && !walkerIds.includes(userId)) {
            return res.status(403).json({ message: "You cannot cancel this walk." });
        }

        // Remove the user from the walker list
        walk.walker = walk.walker.filter((id) => id.toString() !== userId);
        walk.slots += 1;

        // Ensure that admin/marshal stays even if no users remain
        if (walk.walker.length === 0 && walk.marshal) {
            await walk.save(); // Save the walk but don't delete it
            return res.status(200).json({ message: "Walk appointment cancelled, walk remains active with marshal.", walk });
        }

        await walk.save();
        return res.status(200).json({ message: "Your walk appointment has been cancelled.", walk });

    } catch (error) {
        console.error("Error cancelling walk:", error);
        res.status(500).json({ message: "Failed to cancel walk" });
    }
};

