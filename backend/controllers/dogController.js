const { ObjectId } = require("mongodb");
const Dog = require("../models/dogModel");
const mongoose = require("mongoose");

exports.getDogs = async (req, res) => {
	try {
		const data = await Dog.find({});
		res.json(data);
	} catch (error) {
		console.error("Error fetching data:");
		res.status(500).json({ error: "Failed to fetch data" });
	}
};

exports.getDogLogs = async (req, res) => {
	try {
		const data = await Dog.find({}).populate({
			path: "walks",
			populate: {
				path: "walkId",
			},
		});

		res.json(data);
	} catch (error) {
		console.error("Error fetching data:");
		res.status(500).json({ error: "Failed to fetch data" });
	}
};

exports.dogDetail = async (req, res) => {
	// controllers/dogController.js
	try {
		const dogId = req.params.id;

		const dog = await Dog.findById(dogId).populate({
			path: "walks",
			populate: {
				path: "walkId",
			},
		});

		if (!dog) {
			return res.status(404).json({ error: "Dog not found" });
		}

		res.json(dog);
	} catch (error) {
		console.error("Error fetching dog:", error);
		res.status(500).json({ error: "Failed to fetch dog data" });
	}
};

exports.filteredDogs = async (req, res) => {
	try {
		const allDogs = await Dog.find({});

		const today = new Date();
		today.setHours(0, 0, 0, 0); // Reset time to midnight

		const dogsWithNoWalk = allDogs.filter((dog) => !dog.lastWalk);
		const dogsWithPastWalks = allDogs.filter(
			(dog) => dog.lastWalk && new Date(dog.lastWalk) < today
		);

		// Sort dogs with past walks by oldest first
		dogsWithPastWalks.sort(
			(a, b) => new Date(a.lastWalk) - new Date(b.lastWalk)
		);

		const result = [...dogsWithNoWalk, ...dogsWithPastWalks];

		res.json(result);
	} catch (error) {
		console.error("Error fetching data:", error);
		res.status(500).json({ error: "Failed to fetch data" });
	}
};
exports.addDog = async (req, res) => {
	try {
		// Use the image uploaded via Cloudinary
		const imageUrl = req.file?.path || "";

		const newDog = new Dog({
			...req.body,
			imageURL: imageUrl, // use `imageURL` field in the schema
			tags: req.body.tags ? JSON.parse(req.body.tags) : [],
			demeanor: req.body.demeanor || "Red",
			notes: req.body.notes ? JSON.parse(req.body.notes) : [],
		});

		const savedDog = await newDog.save();
		res.status(201).json(savedDog);
	} catch (error) {
		console.error("Error adding dog:", error);
		res.status(500).json({ error: "Failed to add dog" });
	}
};

exports.editDog = async (req, res) => {
	try {
		const { id } = req.params;
		const updatedDog = {
			...req.body,
			tags: req.body.tags || [],
			demeanor: req.body.demeanor || "Red",
			notes: req.body.notes || [],
		};

		const updatedDogData = await Dog.findByIdAndUpdate(
			id, // Find by ID
			{ $set: updatedDog }, // Update fields
			{ new: true } // Return updated document
		);

		if (!updatedDogData) {
			return res.status(404).json({ error: "Dog not found" });
		}

		res.status(200).json({
			message: "Dog updated successfully",
			updatedDog: updatedDogData,
		});
	} catch (error) {
		console.error("Error updating dog:");
		res.status(500).json({ error: "Failed to update dog" });
	}
};

exports.deleteDog = async (req, res) => {
	try {
		const { id } = req.params;
		// Validate that the id is a valid ObjectId
		const objectId = new mongoose.Types.ObjectId(id);

		const result = await Dog.deleteOne({ _id: objectId });

		if (result.deletedCount === 0) {
			return res.status(404).json({ message: "Dog not found" });
		}

		res.status(200).json({ message: "Dog deleted successfully" });
	} catch (error) {
		console.error("Error deleting dog:");
		res.status(500).json({ error: "Failed to delete dog" });
	}
};
