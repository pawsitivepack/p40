const express = require('express');
const router = express.Router();
const { createNotification, getUserNotifications, markNotificationAsRead, sendUpcomingWalkNotifications } = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware"); // make sure this protects your routes

// Create a notification (optional - for admin or system use)
router.post("/notifications", authMiddleware, createNotification);

// Get all notifications for logged-in user
router.get("/user-notifications", authMiddleware, getUserNotifications);
router.get("/send-upcoming-walk-notifications", sendUpcomingWalkNotifications);

// Mark a notification as read
router.patch("/user-notifications/:id/read", authMiddleware, markNotificationAsRead);

module.exports = router;
