const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../middleware/authMiddleware");
// Authentication Routes
router.post("/login", userController.login);
router.post("/google-login", userController.googlelogin);
router.post("/google-signup", userController.googleSignup);
router.post("/signup", userController.signup);

// Protect the myProfile route with verifyToken
router.get("/myprofile", verifyToken, userController.myProfile);

// User Management
router.get("/getAllUsers", verifyToken, userController.getAllUsers);
router.post("/logout", userController.logout);

module.exports = router;
