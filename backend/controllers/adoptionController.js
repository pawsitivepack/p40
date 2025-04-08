const Adoption = require("../models/adoptionModel"); // Import the Adoption model
const { sendAdoptionReplyEmail } = require("../config/mailer"); 

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
		const { user, dogName, message, inquiryId } = req.body;

		if (!user?.email || !user?.firstName || !message || !dogName || !inquiryId) {
			return res.status(400).json({ error: "Missing required fields." });
		}

		// Update the database FIRST
		const updatedInquiry = await Adoption.findByIdAndUpdate(
			inquiryId,
			{
				Status: "Replied",
				ReplyMessage: message,
				ReplyDate: new Date(),
			},
			{ new: true }
		);

		// Try to send the email, but don't fail the request if it breaks
		try {
			await sendAdoptionReplyEmail(user, dogName, message);
		} catch (emailErr) {
			console.error("⚠️ Email failed to send:", emailErr.message || emailErr);
			// Optional: Log this to an error tracking service
		}

		// Always respond success
		res.status(200).json({
			message: "Reply saved and email attempted.",
			updatedInquiry,
		});
	} catch (error) {
		console.error("🔥 Unexpected error in reply handler:", error.message || error);
		res.status(500).json({ error: "Something went wrong while sending reply." });
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