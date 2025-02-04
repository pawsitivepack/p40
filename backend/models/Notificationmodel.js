const notificationSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    dateSent: { type: Date, default: Date.now },
    readStatus: { type: Boolean, default: false }
  }, { timestamps: true });
  
  const Notification = mongoose.model('Notification', notificationSchema);
  module.exports = Notification;