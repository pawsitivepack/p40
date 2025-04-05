// const express = require("express");
// const router = express.Router();
// const CompletedWalk = require("../controllers/completedWalkController");
// const verifyToken = require("../middleware/authMiddleware");
// const verifyMarshal = require("../middleware/verifyMarshal");

// router.post("/", verifyToken, verifyMarshal, CompletedWalk.checkInWalker);
// router.post(
// 	"/addManualWalk",
// 	verifyToken,
// 	verifyMarshal,
// 	CompletedWalk.addManualCompletedWalk
// );

// router.put("/dogadded", verifyToken, verifyMarshal, CompletedWalk.walkedADog);
// router.put(
// 	"/completedUserWalk",
// 	verifyToken,
// 	verifyMarshal,
// 	CompletedWalk.CompletedUserWalk
// );
// router.put(
// 	"/didnotShowup",
// 	verifyToken,
// 	verifyMarshal,
// 	CompletedWalk.DidNotShowUp
// );
// router.get("/", CompletedWalk.finishedWalks);

// module.exports = router;
