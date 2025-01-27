require('dotenv').config(); // Load environment variables
const express = require('express'); // Import Express
const cors = require('cors'); // Import CORS middleware
const { MongoClient, ServerApiVersion } = require('mongodb'); // Import MongoDB client

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001; // Use the port from .env or default to 5000

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URI
const uri = process.env.MONGO_URI;

// Create MongoDB client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Function to connect to MongoDB
async function connectToDatabase() {
  try {
    await client.connect(); // Connect to MongoDB
    console.log('Connected to MongoDB!');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if the connection fails
  }
}

// Route for testing
app.get('/', async (req, res) => {
  try {
    const db = client.db('springboothello'); // Replace with your database name
    const collection = db.collection('springboot'); // Replace with your collection name

    const data = await collection.find({}).toArray(); // Fetch all documents
    res.json(data); // Send the data as JSON
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Start the server and connect to MongoDB
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await connectToDatabase(); // Connect to the database when the server starts
});