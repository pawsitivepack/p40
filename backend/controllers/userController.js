const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const bcrypt = require("bcryptjs");
const User = require("../models/usersModel");
const Walk = require("../models/walkmodel");

// Helper function to generate a JWT
const generateToken = (user) => {
	return jwt.sign(
		{ id: user._id, email: user.email, role: user.role },
		process.env.JWT_SECRET,
		{
			expiresIn: "1h",
		}
	);
};

// Login with email and password
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

exports.googlelogin = async (req, res) => {
	const { token } = req.body;
	const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

	try {
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: process.env.GOOGLE_CLIENT_ID,
		});

		const payload = ticket.getPayload();
		const {
			given_name: firstName,
			family_name: lastName,
			email,
			picture,
			email_verified,
		} = payload;

		if (!email_verified) {
			return res.status(400).json({ message: "Email not verified" });
		}

		let user = await User.findOne({ email });

		if (!user) {
			// Respond with a 302 status and user data for frontend to complete signup
			return res.status(302).json({
				message: "User not found. Please complete the signup process.",
				user: {
					firstName,
					lastName: lastName || "",
					email,
					picture,
				},
			});
		}

		// Generate a token for an existing user
		const jwtToken = generateToken(user);
		res.status(200).json({ token: jwtToken, user });
	} catch (error) {
		console.error("Google Authentication failed:", error);
		res.status(400).json({ message: "Google Authentication failed" });
	}
};

exports.googleSignup = async (req, res) => {
	const { firstName, lastName, email, age, phone, picture } = req.body;

	try {
		let user = await User.findOne({ email });

		if (user) {
			return res.status(400).json({ message: "User already exists" });
		}

		user = new User({
			firstName,
			lastName,
			email,
			age,
			phone,
			picture,
			googleAuth: true,
			role: "user",
		});

		await user.save();
		const jwtToken = generateToken(user);
		res.status(201).json({ token: jwtToken, user });
	} catch (error) {
		console.error("Signup failed:", error);
		res.status(500).json({ message: "Signup failed" });
	}
};
// Signup
exports.signup = async (req, res) => {
	const { firstName, lastName, email, password, age, phone } = req.body;

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
			email,
			age,
			phone,
			password: hashedPassword,
		});

		await newUser.save();
		res.status(201).json({ message: "User registered successfully" });
	} catch (error) {
		console.error("Error during signup:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Middleware to verify token
exports.verifyToken = (req, res, next) => {
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

// Fetch my profile
exports.myProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select("-password");
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json({ user });
	} catch (error) {
		console.error("Error fetching profile:", error);
		res.status(500).json({ message: "Failed to fetch profile" });
	}
};

// Logout (handled on client-side)
exports.logout = (req, res) => {
	res.status(200).json({
		message: "Logout successful. Please remove the token on the client side.",
	});
};

// Fetch all users (optional filtering by role)
exports.getAllUsers = async (req, res) => {
	try {
		const query = req.query.role ? { role: req.query.role } : {};
		const users = await User.find(query, { password: 0 });
		res.status(200).json(users);
	} catch (error) {
		console.error("Error fetching users:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
exports.mywalks = async (req, res) => {
	const userId = req.user.id;
	console.log("Fetching mywalks for user:", userId);

	try {
		// Use populate to fetch detailed information for each walk
		const user = await User.findById(userId).populate({
			path: "dogsWalked",
			populate: [
				{ path: "walker", select: "firstName lastName" }, // Populate walker with firstName and lastName
				{ path: "marshal", select: "firstName lastName role" }, // Populate marshal with firstName, lastName, and role
				{ path: "dog", select: "name breed age healthStatus" }, // Populate dog with name, breed, age, and healthStatus
			],
		});

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json(user.dogsWalked);
	} catch (error) {
		console.error("Error fetching user walks:", error);
		res.status(500).json({ message: "Failed to fetch walks" });
	}
};

exports.editUser = async (req, res) => {
	try {
		const userId = req.params.id;
		const updateData = req.body;

		// Prevent updating sensitive fields like password directly
		const allowedFields = [
			"firstName",
			"lastName",
			"email",
			"role",
			"age",
			"phone",
		];
		const updates = {};

		for (const field of allowedFields) {
			if (updateData[field] !== undefined) {
				updates[field] = updateData[field];
			}
		}

		// Ensure email uniqueness if email is being updated
		if (updates.email) {
			const existingUser = await User.findOne({ email: updates.email });
			if (existingUser && existingUser._id.toString() !== userId) {
				return res.status(400).json({ message: "Email already in use" });
			}
		}

		// Update the user in the database
		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{ $set: updates },
			{ new: true, runValidators: true, select: "-password" }
		);

		if (!updatedUser) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json({
			message: "User updated successfully",
			user: updatedUser,
		});
	} catch (error) {
		console.error("Error updating user:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

exports.deleteUser = async (req, res) => {
	try {
		const userId = req.params.id;

		// Check if the user exists
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// **Check if the user is a walker or marshal before deletion**
		const walksToUpdate = await Walk.find({
			$or: [{ walker: userId }, { marshal: userId }],
			status: "Scheduled",
		});

		// **Remove the user from the `walker` array**
		await Walk.updateMany({ walker: userId }, { $pull: { walker: userId } });

		// **Remove the user from the `marshal` field**
		await Walk.updateMany({ marshal: userId }, { $unset: { marshal: "" } });

		// **Increase slots for all affected walks where status is "Scheduled"**
		for (const walk of walksToUpdate) {
			await Walk.findByIdAndUpdate(walk._id, { $inc: { slots: 1 } });
		}

		// **Delete the user after cleaning up references**
		await User.findByIdAndDelete(userId);

		res.status(200).json({
			message:
				"User removed successfully, walker/marshal removed, slots updated",
			userId,
		});
	} catch (error) {
		console.error("Error deleting user:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};
