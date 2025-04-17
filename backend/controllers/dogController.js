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

exports.getIndividualLog = async (req, res) => {
	const dogId = req.params.id;
	console.log("Dog ID:", dogId);
	try {
		const data = await Dog.findById(dogId).populate({
			path: "walks",
			populate: {
				path: "walkId",
			},
		});

		if (!data) {
			return res.status(404).json({ error: "Dog not found" });
		}

		res.json(data);
	} catch (error) {
		console.error("Error fetching data:", error);
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
		const now = new Date();
		const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

		const dogs = await Dog.find({
			adopted: false,
			status: "Available",
		}).populate({
			path: "walks",
			model: "BookedWalks",
			match: { date: { $gte: sevenDaysAgo } }, // Only include walks in the last 7 days
			select: "date",
		});

		const scoredDogs = dogs.map((dog) => {
			const walks = dog.walks || [];

			if (walks.length === 0) {
				return {
					dog,
					daysSinceLastWalk: Infinity,
					walkCount: 0,
				};
			}

			const walkDates = walks.map((w) => new Date(w.date));
			const mostRecentWalk = new Date(
				Math.max(...walkDates.map((d) => d.getTime()))
			);
			const daysSinceLastWalk = Math.floor(
				(now - mostRecentWalk) / (1000 * 60 * 60 * 24)
			);

			return {
				dog,
				daysSinceLastWalk,
				walkCount: walks.length,
			};
		});

		// Sort by: 1. days since last walk (desc), then 2. walk count (asc)
		const sorted = scoredDogs
			.sort((a, b) => {
				if (b.daysSinceLastWalk !== a.daysSinceLastWalk) {
					return b.daysSinceLastWalk - a.daysSinceLastWalk;
				}
				return a.walkCount - b.walkCount;
			})
			.map((e) => e.dog);

		res.json(sorted);
	} catch (error) {
		console.error("Error fetching sorted dogs:", error);
		res.status(500).json({ error: "Failed to fetch dogs" });
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
