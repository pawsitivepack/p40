const mongoose = require('mongoose');
const { Schema } = mongoose;

const dogSchema = new Schema({
  name: { type: String, required: true },
  breed: { type: String, required: true },
  color:{type: String, required: true},
  age:{type: Number, required: true},
    
  size: { type: String, enum: ['Small', 'Medium', 'Large'], required: true },
  healthIssues: { type: String },
  status: { type: String, enum: ['Available', 'Adopted', 'Deceased'], default: 'Available' },
  demeanor: { type: String },
  photos: [{ type: String }],  // Array of photo URLs
  notes: { type: String }
}, { timestamps: true });

const Dog = mongoose.model('Dog', dogSchema);
module.exports = Dog;