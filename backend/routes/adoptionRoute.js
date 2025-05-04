const express = require("express");
const router = express.Router();
const adoptionController = require("../controllers/adoptionController");
const verifyToken = require("../middleware/authMiddleware"); 
const verifyAdmin = require("../middleware/verifyAdmin");

// Create a new adoption request
router.post("/", verifyToken, adoptionController.createAdoption);

//  Only admins can view all
router.get("/adoptions", verifyToken, verifyAdmin, adoptionController.getAllAdoptions);

// Only admins see pending
router.get("/pending", verifyToken, verifyAdmin, adoptionController.getPendingAdoptions);

// Admin replies
router.post("/reply", verifyToken, verifyAdmin, adoptionController.replyToAdoptionInquiry);

// Update adoption status (admin)
router.put("/:id", verifyToken, verifyAdmin, adoptionController.updateAdoptionStatus);

//  New: Only logged-in user can view their own inquiries
router.get("/my", verifyToken, adoptionController.getMyAdoptions);

//  Single inquiry for a dog by this user
router.get("/user-inquiry/:userId/:dogId", verifyToken, adoptionController.getUserInquiryForDog);

// Allow user or admin to delete their own request
router.delete("/:id", verifyToken, adoptionController.deleteAdoption);


module.exports = router; 