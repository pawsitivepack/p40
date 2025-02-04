require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const mongoose= require ('mongoose');
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

app.put('/dogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = client.db('p40Project');
    const collection = db.collection('dogs');

    // Convert id to ObjectId (MongoDB uses ObjectId for _id)
    const { ObjectId } = require('mongodb');
    const objectId = new ObjectId(id);

    const updatedDog = req.body;
    delete updatedDog._id; // Ensure _id is not modified

    // Update the dog using _id as reference
    const result = await collection.updateOne(
      { _id: objectId }, // Find dog by _id
      { $set: updatedDog } // Update only the provided fields
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    // Fetch the updated dog to return the updated data
    const updatedDogData = await collection.findOne({ _id: objectId });

    res.status(200).json({
      message: 'Dog updated successfully',
      updatedDog: updatedDogData,  // Return the updated dog data
    });
  } catch (error) {
    console.error('Error updating dog:', error);
    res.status(500).json({ error: 'Failed to update dog' });
  }
});

// DELETE route to delete a dog by its _id using MongoDB's native client
app.delete('/dogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Tried to delete a dog with id ${id}`);
console.log("times")
    // Validate that the id is a valid ObjectId
    const objectId = new mongoose.Types.ObjectId(id);

    const db = client.db('p40Project'); // Use the same database as in POST
    const collection = db.collection('dogs');

    const result = await collection.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Dog not found' });
    }

    res.status(200).json({ message: 'Dog deleted successfully' });
  } catch (error) {
    console.error('Error deleting dog:', error);
    res.status(500).json({ error: 'Failed to delete dog' });
  }
});

// Start the server
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await connectToDatabase();
});