const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyMarshal = require("../middleware/verifyMarshal");
const { upload } = require("../config/cloudinary");

// Authentication Routes
router.post("/login", userController.login);
router.post("/google-login", userController.googlelogin);
router.post("/google-signup", userController.googleSignup);
router.post("/signup", userController.signup);
router.post("/refresh-token", verifyToken, userController.refreshToken);
// Protect the myProfile route with verifyToken
router.get("/myprofile", verifyToken, userController.myProfile);

// User Management
router.get(
	"/getAllUsers",
	verifyToken,
	verifyMarshal,
	userController.getAllUsers
);
router.put("/editUser/:id", verifyToken, verifyAdmin, userController.editUser);
router.get(
	"/viewUser/:id",
	verifyToken,
	verifyMarshal,
	userController.viewUserDetail
);
router.post("/verify-otp", userController.verifyOtp);
router.post("/resend-otp", userController.resendOtp);
router.delete(
	"/deleteUser/:id",
	verifyToken,
	verifyAdmin,
	userController.deleteUser
);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
router.post("/logout", userController.logout);

// Route to Update Profile Picture
router.put(
	"/updateProfilePicture",
	verifyToken,
	upload.single("picture"),
	userController.updateProfilePicture
);

module.exports = router;
