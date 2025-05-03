const express = require("express");
const router = express.Router();
const WalkController = require("../controllers/scheduledWalkController");
const verifyToken = require("../middleware/authMiddleware");
const verifyMarshal = require("../middleware/verifyMarshal");
const verifyAdmin = require("../middleware/verifyAdmin");

router.post(
	"/newWalk",
	verifyToken,
	verifyMarshal,
	WalkController.addScheduledWalk
);
router.get("/checkInSchedules", WalkController.checkInScheduledWalks);

router.get(
	"/",
	verifyToken,

	WalkController.getAllScheduledWalks
);
router.get("/:id", verifyToken, WalkController.getMyScheduledWalks);
router.post("/confirm", verifyToken, WalkController.confirm);
router.delete("/cancel/:walkId", verifyToken, WalkController.cancelWalk);
router.delete(
	"/:id",
	verifyToken,
	verifyAdmin,
	WalkController.cancelSingleWalk
);
router.delete(
	"/cancel-day/:date",
	verifyToken,
	verifyAdmin,
	WalkController.cancelWalksForDay
);
module.exports = router;
