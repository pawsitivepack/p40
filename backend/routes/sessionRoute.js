const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");

require("dotenv").config();

const router = express.Router();

// Configure session middleware
router.use(
  session({
    secret: process.env.SESSION_SECRET, // Store in .env
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // Store sessions in MongoDB
    }),
    cookie: {
      maxAge: 1000 * 60 * 2, 
      httpOnly: true, // Prevents client-side JS access
      secure: process.env.NODE_ENV === "production", // Secure in production
    },
  })
);

// Session Check Route
router.get("/session-check", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// Logout Route
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out" });
    }
    res.clearCookie("connect.sid"); // Clear session cookie
    res.status(200).json({ message: "Logged out successfully" });
  });
});

module.exports = router;
