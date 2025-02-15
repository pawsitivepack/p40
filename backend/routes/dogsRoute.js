const express = require("express");
const router = express.Router();
const dogController = require("../controllers/dogController");
const verifyAdmin = require("../middleware/verifyAdmin");
verifyToken = require("../middleware/authMiddleware");

router.get("/", dogController.getDogs);
router.post("/", verifyToken, verifyAdmin, dogController.addDog);
router.put("/:id", verifyToken, verifyAdmin, dogController.editDog);
router.delete("/:id", verifyToken, verifyAdmin, dogController.deleteDog);

module.exports = router;
