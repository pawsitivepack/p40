require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001; 

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URI
const uri = process.env.MONGO_URI;
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
    await client.connect();
    console.log('Connected to MongoDB!');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

// Route to get all dogs
app.get('/dogs', async (req, res) => {
  try {
    const db = client.db('p40Project'); 
    const collection = db.collection('dogs');
    const data = await collection.find({}).toArray();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Route to add a new dog
app.post('/dogs', async (req, res) => {
  try {
    const db = client.db('p40Project');
    const collection = db.collection('dogs');

    const newDog = req.body;
    const result = await collection.insertOne(newDog);

    res.status(201).json({ ...newDog, _id: result.insertedId });
  } catch (error) {
    console.error('Error adding dog:', error);
    res.status(500).json({ error: 'Failed to add dog' });
  }
});

// Start the server
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await connectToDatabase();
});