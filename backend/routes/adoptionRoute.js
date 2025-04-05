const express = require("express");
const router = express.Router();
const adoptionController = require("../controllers/adoptionController");

// Create a new adoption request
router.post("/", adoptionController.createAdoption);


// Get all adoption requests
router.get("/adoptions", adoptionController.getAllAdoptions);
router.get("/pending", adoptionController.getPendingAdoptions); // Add this!

// Update adoption status
router.put("/:id", adoptionController.updateAdoptionStatus);
// Admin reply to adoption inquiry via email
router.post("/reply", adoptionController.replyToAdoptionInquiry);
router.get("/user-inquiry/:userId/:dogId", adoptionController.getUserInquiryForDog);

// Delete an adoption request
router.delete("/:id", adoptionController.deleteAdoption);

module.exports = router; 