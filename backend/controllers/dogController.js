const { ObjectId } = require('mongodb');

let client;

exports.setClient = (connectedClient) => {
  client = connectedClient;
}

exports.getDogs = async (req, res) => {
  try {
    const db = client.db('p40Project');
    const collection = db.collection('dogs');
    const data = await collection.find({}).toArray();
    res.json(data);
  } catch (error) {
    console.error('Error fetching dogs:', error);
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
};

exports.addDog = async (req, res) => {
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
};

exports.editDog = async (req, res) => {
  try {
    const { id } = req.params;
    const db = client.db('p40Project');
    const collection = db.collection('dogs');
    const objectId = new ObjectId(id);
    const updatedDog = req.body;
    delete updatedDog._id;
    const result = await collection.updateOne(
      { _id: objectId },
      { $set: updatedDog }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }
    const updatedDogData = await collection.findOne({ _id: objectId });
    res.status(200).json({
      message: 'Dog updated successfully',
      updatedDog: updatedDogData,
    });
  } catch (error) {
    console.error('Error updating dog:', error);
    res.status(500).json({ error: 'Failed to update dog' });
  }
};

exports.deleteDog = async (req, res) => {
  try {
    const { id } = req.params;
    const db = client.db('p40Project');
    const collection = db.collection('dogs');
    const objectId = new ObjectId(id);
    const result = await collection.deleteOne({ _id: objectId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Dog not found' });
    }
    res.status(200).json({ message: 'Dog deleted successfully' });
  } catch (error) {
    console.error('Error deleting dog:', error);
    res.status(500).json({ error: 'Failed to delete dog' });
  }
};
