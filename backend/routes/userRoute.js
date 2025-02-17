const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyMarshal = require("../middleware/verifyMarshal");
// Authentication Routes
router.post("/login", userController.login);
router.post("/google-login", userController.googlelogin);
router.post("/google-signup", userController.googleSignup);
router.post("/signup", userController.signup);

// Protect the myProfile route with verifyToken
router.get("/myprofile", verifyToken, userController.myProfile);
router.get("/mywalks", verifyToken, userController.mywalks);

// User Management
router.get(
	"/getAllUsers",
	verifyToken,
	verifyMarshal,
	userController.getAllUsers
);
router.put("/editUser/:id", verifyToken, verifyAdmin, userController.editUser);
router.delete(
	"/deleteUser/:id",
	verifyToken,
	verifyAdmin,
	userController.deleteUser
);

router.post("/logout", userController.logout);

module.exports = router;
