const scheduledWalkSchema = new Schema({
    dog: { type: mongoose.Schema.Types.ObjectId, ref: 'Dog', required: true },
    walker: { type: mongoose.Schema.Types.ObjectId, ref: 'Walker', required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },  // Location of the walk
    status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' }
  }, { timestamps: true });
  
  const ScheduledWalk = mongoose.model('ScheduledWalk', scheduledWalkSchema);
  module.exports = ScheduledWalk;