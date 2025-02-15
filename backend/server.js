require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dogRoutes = require("./routes/dogsRoute");
const userRoutes = require("./routes/userRoute");
const schedulewalk = require("./routes/walkRoute");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(
	cors({
		origin: `${process.env.FRONTEND_URL}`,
		credentials: true,
	})
);
app.use(express.json());

// MongoDB Connection
async function connectToDatabase() {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("Connected to MongoDB using Mongoose!");
	} catch (err) {
		console.error("MongoDB connection error:", err);
		process.exit(1);
	}
}

// Routes
app.use("/users", userRoutes);
app.use("/dogs", dogRoutes);
app.use("/scheduledWalks", schedulewalk);

// Start the Server
app.listen(PORT, async () => {
	console.log(`Server is running on http://localhost:${PORT}`);
	await connectToDatabase();
});
