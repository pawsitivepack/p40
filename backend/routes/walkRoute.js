const express = require("express");
const router = express.Router();
const WalkController = require("../controllers/scheduledWalkController");

router.post("/newWalk", WalkController.addScheduledWalk);
router.get("/", WalkController.getAllScheduledWalks);

module.exports = router;
