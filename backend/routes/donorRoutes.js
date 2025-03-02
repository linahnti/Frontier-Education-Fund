const express = require("express");
const donorController = require("../controllers/donorController");

const router = express.Router();

// Approve a donation request
router.put("/:donorId/approve-request", donorController.approveDonationRequest);

// Complete a donation
router.put("/:donorId/complete-donation", donorController.completeDonation);

// Get donor details (including donations made)
router.get("/:donorId", donorController.getDonorDetails);

module.exports = router;