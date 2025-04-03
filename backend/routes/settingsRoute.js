// routes/settings.js
const express = require("express");
const router = express.Router();
const {
	getDateSettings,
	updateDateSettings,
} = require("../controllers/dateSettingController");

router.get("/restrictions", getDateSettings);
router.put("/restrictions", updateDateSettings); // or .post()

module.exports = router;
