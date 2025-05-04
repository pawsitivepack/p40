const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Can be any user or admin account
    default: null // null means it's a global/broadcast notification
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'all'], // who should see this notification
    default: 'user'
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['booking', 'adoption', 'marshalApplication', 'announcement', 'upcoming'],
    default: 'booking'
  },
  dateSent: {
    type: Date,
    default: Date.now
  },
  readStatus: {
    type: Boolean,
    default: false
  },
  walkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ScheduledWalk",
    required: false,
  },
  dogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dog",
    required: false,
  },  
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
