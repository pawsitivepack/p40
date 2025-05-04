const cron = require("node-cron");
const ScheduledWalk = require("../models/walkmodel");
const BookedWalks = require("../models/BookedModel");
const User = require("../models/usersModel");
const Notification = require("../models/Notificationmodel");
const { sendWalkReminderEmail } = require("../config/mailer");

//  Run every day at 12:05 AM
cron.schedule("5 0 * * * *", async () => {
  const now = new Date();

  // Define full day window: today 00:00:00 to 23:59:59
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const bookedWalks = await BookedWalks.find({
    date: { $gte: startOfDay, $lte: endOfDay },
    status: "booked"
  }).populate("userId");

  for (const booking of bookedWalks) {
    const user = booking.userId;

    const alreadyNotified = await Notification.findOne({
      recipient: user._id,
      type: "upcoming",
      walkId: booking.walkId,
    });

    if (!alreadyNotified) {
      await Notification.create({
        recipient: user._id,
        role: "user",
        type: "upcoming",
        message: `Reminder: You have a walk today on ${new Date(
          booking.date
        ).toLocaleString()}.`,
        readStatus: false,
        walkId: booking.walkId,
      });

      await sendWalkReminderEmail(user, booking); 
    }
  }

  console.log("Full-day walk reminders sent.");
});
