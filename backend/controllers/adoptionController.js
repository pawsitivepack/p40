const Adoption = require("../models/adoptionModel"); // Import the Adoption model
const { sendAdoptionReplyEmail } = require("../config/mailer"); 
const Notification = require("../models/Notificationmodel");
const Dog = require("../models/dogModel");


// Create a new adoption request
exports.createAdoption = async (req, res) => {
  try {
    const { Dogid, Userid, Message } = req.body;
    const adoption = new Adoption({ Dogid, Userid, Message });
    await adoption.save();
    res.status(201).json({ message: "Adoption request created successfully", adoption });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all adoption requests
exports.getAllAdoptions = async (req, res) => {
  try {
    const adoptions = await Adoption.find().populate("Dogid").populate("Userid");
    res.status(200).json(adoptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// New: Get only pending adoptions
exports.getPendingAdoptions = async (req, res) => {
  try {
    const pending = await Adoption.find({ Status: "Pending" }).populate("Dogid").populate("Userid");
    res.status(200).json(pending);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyAdoptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const adoptions = await Adoption.find({ Userid: userId }).populate("Dogid");
    res.status(200).json(adoptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Update adoption status
exports.updateAdoptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { Status } = req.body;
    const adoption = await Adoption.findByIdAndUpdate(id, { Status }, { new: true });
    if (!adoption) {
      return res.status(404).json({ message: "Adoption request not found" });
    }
    res.status(200).json({ message: "Adoption status updated successfully", adoption });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.replyToAdoptionInquiry = async (req, res) => {
  try {
    const { message, inquiryId } = req.body;

    // Get the adoption inquiry and populate full user and dog data
    const adoption = await Adoption.findById(inquiryId)
      .populate("Userid") // full user
      .populate("Dogid"); // full dog

    if (!adoption) {
      return res.status(404).json({ error: "Adoption inquiry not found." });
    }

    const user = adoption.Userid;
    const dog = adoption.Dogid;

    if (!user || !user._id || !message || !dog?.name) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Update the inquiry
    const updatedInquiry = await Adoption.findByIdAndUpdate(
      inquiryId,
      {
        Status: "Replied",
        ReplyMessage: message,
        ReplyDate: new Date(),
      },
      { new: true }
    );

    // Create the notification for that specific user
    await Notification.create({
      recipient: user._id,
      role: "user",
      type: "adoption",
      dogId: dog._id,
      message: `Your adoption inquiry for ${dog.name} has been replied to.`,
      readStatus: false,
    });

    // Send email (optional)
    try {
      await sendAdoptionReplyEmail(user, dog.name, message);
    } catch (emailErr) {
      console.error("⚠️ Email failed to send:", emailErr.message || emailErr);
    }

    res.status(200).json({
      message: "Reply saved and notification sent.",
      updatedInquiry,
    });
  } catch (error) {
    console.error("🔥 Error in replyToAdoptionInquiry:", error.message || error);
    res.status(500).json({ error: "Something went wrong." });
  }
};


exports.getUserInquiryForDog = async (req, res) => {
  try {
    const { userId, dogId } = req.params;
    const inquiry = await Adoption.findOne({ Dogid: dogId, Userid: userId });
    if (!inquiry) return res.status(404).json(null);
    res.status(200).json(inquiry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Delete an adoption request
exports.deleteAdoption = async (req, res) => {
  try {
    const { id } = req.params;
    const adoption = await Adoption.findByIdAndDelete(id);
    if (!adoption) {
      return res.status(404).json({ message: "Adoption request not found" });
    }
    res.status(200).json({ message: "Adoption request deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};