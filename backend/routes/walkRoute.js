const express = require("express");
const router = express.Router();
const WalkController = require("../controllers/scheduledWalkController");
const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/verifyAdmin");

router.post(
	"/newWalk",
	verifyToken,
	verifyAdmin,
	WalkController.addScheduledWalk
);
router.get("/", verifyToken, WalkController.getAllScheduledWalks);

module.exports = router;
