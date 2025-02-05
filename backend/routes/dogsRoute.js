const express = require("express");
const router = express.Router();
const dogController = require("../controllers/dogController");

router.get("/", dogController.getDogs);
router.post("/", dogController.addDog);
router.put("/:id", dogController.editDog);
router.delete("/:id", dogController.deleteDog);

module.exports = router;
