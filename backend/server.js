require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dogRoutes = require("./routes/dogsRoute");
const userRoutes = require("./routes/userRoute");
const schedulewalk = require("./routes/walkRoute");
// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

//dog routes
app.use("/dogs", dogRoutes);
app.use("/scheduledWalks", schedulewalk);
app.use("/users", userRoutes);

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

// Start the server
app.listen(PORT, async () => {
	console.log(`Server is running on http://localhost:${PORT}`);
	await connectToDatabase();
});
