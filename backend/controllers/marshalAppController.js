const { ObjectId } = require("mongodb");
const MarshalApp = require("../models/marshalAppModel");
const mongoose = require("mongoose");
const User = require("../models/usersModel");
const { sendMarshalApplicationStatusEmail } = require("../config/mailer");

exports.getMarshalApp = async (req, res) => {
	try {
		const data = await MarshalApp.find({ appStatus: "Pending" })
			.populate("userId", "-password -__v") // Populating user info and excluding sensitive fields
			.exec();

		res.json(data);
	} catch (error) {
		console.error("Error fetching data:", error);
		res.status(500).json({ error: "Failed to fetch data" });
	}
};

exports.addMarshalApp = async (req, res) => {
	console.log(req.body);
	try {
		const { userId, message } = req.body;

		// Validate input data
		if (!userId) {
			return res.status(400).json({ error: "Valid userId is required" });
		}

		if (!message || message.trim() === "") {
			return res.status(400).json({ error: "Message is required" });
		}

		// Check if the user has an existing application with "Pending" status
		const existingApplication = await MarshalApp.findOne({
			userId,
			appStatus: "Pending",
		});

		if (existingApplication) {
			return res.status(400).json({
				error:
					"You already have a pending application. Please wait for approval.",
			});
		}

		// Create a new Marshal Application
		const newApp = new MarshalApp({
			userId,
			message,
		});

		// Save to the database
		const savedApp = await newApp.save();

		res.status(201).json(savedApp);
	} catch (error) {
		console.error("Error adding marshal application:", error);
		res.status(500).json({ error: "Failed to add marshal application" });
	}
};

exports.updateMarshalAppStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { appStatus, adminMessage } = req.body;

		if (!["Approved", "Rejected"].includes(appStatus)) {
			return res.status(400).json({ error: "Invalid status value" });
		}

		// Update the application status
		const updatedApp = await MarshalApp.findByIdAndUpdate(
			id,
			{ appStatus },
			{ new: true }
		).populate("userId");

		if (!updatedApp) {
			return res.status(404).json({ error: "Application not found" });
		}

		// If approved, update user's role to 'marshal'
		if (appStatus === "Approved") {
			await User.findByIdAndUpdate(updatedApp.userId._id, { role: "marshal" });
		}

		// Customize email message based on status
		const message =
			appStatus === "Approved"
				? adminMessage || "Congratulations! Your application has been approved."
				: adminMessage || "Unfortunately, your application has been rejected.";

		await sendMarshalApplicationStatusEmail(
			updatedApp.userId,
			appStatus,
			message
		);

		res.status(200).json({
			message: `Application ${appStatus} and email notification sent.`,
		});
	} catch (error) {
		console.error("Error updating application status:", error);
		res.status(500).json({ error: "Failed to update application status" });
	}
};
