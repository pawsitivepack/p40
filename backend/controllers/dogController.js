const { ObjectId } = require("mongodb");
const Dog = require("../models/dogModel");
const mongoose = require("mongoose");

exports.getDogs = async (req, res) => {
	try {
		const data = await Dog.find({});
		res.json(data);
	} catch (error) {
		console.error("Error fetching data:", error);
		res.status(500).json({ error: "Failed to fetch data" });
	}
};

exports.addDog = async (req, res) => {
	try {
		const newDog = new Dog(req.body); // Create a new instance of the Dog model
		const savedDog = await newDog.save(); // Save to the database
		res.status(201).json(savedDog);
	} catch (error) {
		console.error("Error adding dog:", error);
		res.status(500).json({ error: "Failed to add dog" });
	}
};

exports.editDog = async (req, res) => {
	try {
		const { id } = req.params;
		const updatedDog = req.body;

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
		console.error("Error updating dog:", error);
		res.status(500).json({ error: "Failed to update dog" });
	}
};

exports.deleteDog = async (req, res) => {
	try {
		const { id } = req.params;
		console.log(`Tried to delete a dog with id ${id}`);
		console.log("times");
		// Validate that the id is a valid ObjectId
		const objectId = new mongoose.Types.ObjectId(id);

		const result = await Dog.deleteOne({ _id: objectId });

		if (result.deletedCount === 0) {
			return res.status(404).json({ message: "Dog not found" });
		}

		res.status(200).json({ message: "Dog deleted successfully" });
	} catch (error) {
		console.error("Error deleting dog:", error);
		res.status(500).json({ error: "Failed to delete dog" });
	}
};
