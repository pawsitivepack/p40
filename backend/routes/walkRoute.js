const express = require("express");
const router = express.Router();
const WalkController = require("../controllers/scheduledWalkController");
const verifyToken = require("../middleware/authMiddleware");
const verifyMarshal = require("../middleware/verifyMarshal");

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
module.exports = router;
