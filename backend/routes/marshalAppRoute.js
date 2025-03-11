const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();
const marshalAppController = require("../controllers/marshalAppController");
const verifyAdmin = require("../middleware/verifyAdmin");

router.get("/", verifyToken, verifyAdmin, marshalAppController.getMarshalApp);
router.post("/", verifyToken, marshalAppController.addMarshalApp);
router.put(
	"/:id",
	verifyToken,
	verifyAdmin,
	marshalAppController.updateMarshalAppStatus
);

module.exports = router;
