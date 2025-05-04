const Notification = require("../models/Notificationmodel");
const BookedWalks = require("../models/BookedModel");

// Create a notification
exports.createNotification = async (req, res) => {
  try {
    const { recipient, role, message, type } = req.body;

    if (!message || !type || !role) {
      return res.status(400).json({ message: "Message, role, and type are required." });
    }

    const notification = await Notification.create({
      recipient: recipient || null,
      role,
      message,
      type,
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: "Server error while creating notification." });
  }
};

// Get notifications for logged-in user/admin
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role; // Assuming user role is available from middleware

    const notifications = await Notification.find({
      $or: [
        { recipient: userId },
        { recipient: null, role: { $in: [userRole, 'all'] } }
      ]
    }).sort({ createdAt: -1 });
    
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error while fetching notifications." });
  }
};

// Mark a specific notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    // If it's a personal notification, only the recipient can mark as read
    if (notification.recipient && notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to mark this notification as read." });
    }

    notification.readStatus = true;
    await notification.save();

    res.status(200).json({ message: "Notification marked as read." });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Server error while updating notification." });
  }
};

exports.sendUpcomingWalkNotifications = async (req, res) => {
  try {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingBookedWalks = await BookedWalks.find({
      date: { $gte: now, $lte: next24Hours },
      status: "booked",
    })
      .populate("userId")
      .populate("walkId");

    for (const walk of upcomingBookedWalks) {
      const alreadyNotified = await Notification.findOne({
        recipient: walk.userId._id,
        type: "upcoming",
        relatedWalkId: walk.walkId?._id,
      });

      if (!alreadyNotified) {
        await Notification.create({
          recipient: walk.userId._id,
          role: "user",
          type: "upcoming",
          message: `Reminder: You have a dog walk scheduled on ${new Date(walk.date).toLocaleDateString()} at ${new Date(walk.date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })} at ${walk.location || walk.walkId?.location || "the scheduled location"}.`,
          relatedWalkId: walk.walkId?._id,
          readStatus: false,
        });
      }
    }

    res.status(200).json({ message: "Upcoming walk notifications sent!" });
  } catch (error) {
    console.error("Error sending upcoming walk notifications:", error);
    res.status(500).json({ error: "Failed to send upcoming walk notifications." });
  }
};
