const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Authentication Routes
router.post("/login", userController.login);
router.post("/google-login", userController.googlelogin);
router.post("/google-signup", userController.googleSignup);
router.post("/signup", userController.signup);

// Protect the myProfile route with verifyToken
router.get("/myprofile", userController.verifyToken, userController.myProfile);

// User Management
router.get("/getAllUsers", userController.getAllUsers);
router.post("/logout", userController.logout);

module.exports = router;
