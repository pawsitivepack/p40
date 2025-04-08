const express = require("express");
const router = express.Router();
const BookedWalks = require("../controllers/BookedWalksContoller");
const verifyToken = require("../middleware/authMiddleware");
const verifyMarshal = require("../middleware/verifyMarshal");

router.post("/", verifyToken, verifyMarshal, BookedWalks.checkInWalker);
router.post(
	"/addManualWalk",
	verifyToken,
	verifyMarshal,
	BookedWalks.addManualCompletedWalk
);

router.get("/userWalks", verifyToken, BookedWalks.getUserWalks); // Get all walks for a user
router.get("/pastWalks", verifyToken, BookedWalks.getPastUserWalks);
router.get("/upcomingWalks", verifyToken, BookedWalks.getUpcomingUserWalks);

router.put("/dogadded", verifyToken, verifyMarshal, BookedWalks.walkedADog);
router.put(
	"/completedUserWalk",
	verifyToken,
	verifyMarshal,
	BookedWalks.CompletedUserWalk
);
router.put(
	"/didnotShowup",
	verifyToken,
	verifyMarshal,
	BookedWalks.DidNotShowUp
);
router.get("/", verifyToken, verifyMarshal, BookedWalks.finishedWalks);
router.get(
	"/allScheduledWawalks",
	verifyToken,
	verifyMarshal,
	BookedWalks.getAllBookedWalks
);

module.exports = router;
