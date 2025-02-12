const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const User = require("../models/usersModel");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // Using bcryptjs

// Helper function to generate a JWT
const generateToken = (user) => {
	return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
		expiresIn: "1h",
	});
};

// Route for Login
exports.login = async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ message: "Invalid email or password" });
		}

		const isMatch = bcrypt.compareSync(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: "Invalid email or password" });
		}

		// Generate JWT token
		const token = generateToken(user);

		res.status(200).json({
			message: "Login successful",
			token,
			user: {
				id: user._id,
				email: user.email,
				name: `${user.firstName} ${user.lastName}`,
			},
		});
	} catch (error) {
		console.error("Error during login:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Route for Signup
exports.signup = async (req, res) => {
	const { firstName, lastName, age, phone, email, password } = req.body;

	try {
		if (!email || !password || !firstName || !lastName) {
			return res.status(400).json({ message: "Missing required fields" });
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: "Email is already registered" });
		}

		const hashedPassword = bcrypt.hashSync(password, 10);

		const newUser = new User({
			firstName,
			lastName,
			age,
			phone,
			email,
			password: hashedPassword,
		});

		await newUser.save();

		res.status(201).json({
			message: "User registered successfully",
			user: {
				id: newUser._id,
				email: newUser.email,
				name: `${newUser.firstName} ${newUser.lastName}`,
			},
		});
	} catch (error) {
		console.error("Error during signup:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Middleware to verify token
const verifyToken = (req, res, next) => {
	const token = req.headers["authorization"];
	if (!token) {
		return res.status(401).json({ message: "No token provided" });
	}

	try {
		const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
		req.user = decoded;
		next();
	} catch (error) {
		res.status(401).json({ message: "Invalid or expired token" });
	}
};

// Route for My Profile
exports.myProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select("-password");
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json({
			user: {
				firstName: user.firstName,
				lastName: user.lastName,
				age: user.age,
				phone: user.phone,
				email: user.email,
				role: user.role,
				userPoints: user.userPoints,
				isAdmin: user.isAdmin,
			},
		});
	} catch (err) {
		res.status(500).json({ message: "Failed to fetch profile", error: err });
	}
};

// Route for Logout (client-side only)
exports.logout = (req, res) => {
	// Since JWT is stateless, logout should be handled on the client by removing the token
	res
		.status(200)
		.json({
			message: "Logout successful. Please remove the token on the client side.",
		});
};

// Route for getting all users
exports.getAllUsers = async (req, res) => {
	try {
		const role = req.query.role;
		let query = {};

		if (role) {
			query.role = role;
		}

		const users = await User.find(query, { password: 0 });
		res.status(200).json(users);
	} catch (error) {
		console.error("Error fetching users:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

module.exports.verifyToken = verifyToken;
