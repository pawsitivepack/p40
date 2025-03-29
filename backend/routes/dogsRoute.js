const express = require("express");
const router = express.Router();
const dogController = require("../controllers/dogController");
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyToken = require("../middleware/authMiddleware");
const { uploadDogPic } = require("../config/cloudinary");

router.get("/", dogController.getDogs);
router.get("/filtered", dogController.filteredDogs);
router.get("/logs", dogController.getDogLogs);
router.get("/logs/:id", dogController.getIndividualLog);
router.post(
	"/",
	verifyToken,
	verifyAdmin,
	uploadDogPic.single("image"),
	dogController.addDog
);
router.get("/:id", dogController.dogDetail);
router.put("/:id", verifyToken, verifyAdmin, dogController.editDog);
router.delete("/:id", verifyToken, verifyAdmin, dogController.deleteDog);

module.exports = router;
