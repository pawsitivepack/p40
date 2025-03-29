const express = require("express");
const router = express.Router();
const waiverController = require("../controllers/waiverController");
const verifyToken = require("../middleware/authMiddleware"); // ✅ Make sure path is correct

router.post("/submit", verifyToken, waiverController.waiver);
router.get("/status", verifyToken, waiverController.waiverStatus);

module.exports = router;
