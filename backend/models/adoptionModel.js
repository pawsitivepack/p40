const mongoose = require("mongoose");

const adoptionModelSchema = new mongoose.Schema({
  Dogid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dog",
    required: true,
  },
  Userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  Status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  Message: {
    type: String,
    required: false,
  },
  ReplyMessage: {
    type: String,
  },
  ReplyDate: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model("Adoption", adoptionModelSchema);