require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const dogRoutes = require("./routes/dogsRoute");
const userRoutes = require("./routes/userRoute");
const schedulewalk = require("./routes/walkRoute");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true, // Allow cookies
	})
);
app.use(express.json());

// MongoDB Connection URI
const uri = process.env.MONGO_URI;
// Function to connect to MongoDB using Mongoose
async function connectToDatabase() {
	try {
		await mongoose.connect(uri);
		console.log("Connected to MongoDB using Mongoose!");
	} catch (err) {
		console.error("MongoDB connection error:", err);
		process.exit(1);
	}
}

app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		store: MongoStore.create({
			mongoUrl: process.env.MONGO_URI,
		}),
		cookie: {
			maxAge: 1000 * 60 * 20,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
		},
	})
);

// Routes
app.use("/dogs", dogRoutes);
app.use("/scheduledWalks", schedulewalk);
app.use("/users", userRoutes);

// Start the server
app.listen(PORT, async () => {
	console.log(`Server is running on http://localhost:${PORT}`);
	await connectToDatabase();
});
