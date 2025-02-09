require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const sessionRoutes = require("./routes/sessionRoute"); // Import session route
const userRoutes = require("./routes/userRoute");
const dogRoutes = require("./routes/dogsRoute");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Apply session middleware before user routes
app.use(sessionRoutes); // Ensure sessions are available in /users

// Define routes
app.use("/users", userRoutes);
app.use("/dogs", dogRoutes);

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

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await connectToDatabase();
});
