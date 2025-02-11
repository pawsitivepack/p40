const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const bcrypt = require("bcrypt");

router.post("/login", userController.login);
router.post("/signup", userController.signup);
router.get("/getAllUsers", userController.getAllUsers);
router.get("/profile", userController.myProfile);
router.post("/logout", userController.logout);

module.exports = router;
