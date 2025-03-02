const express = require("express");
const donationRequestController = require("../controllers/donationRequestController");

const router = express.Router();

// Create a donation request
router.post("/", donationRequestController.createDonationRequest);

// Approve a donation request
router.put(
  "/:requestId/approve",
  donationRequestController.approveDonationRequest
);

// Complete a donation
router.put("/:requestId/complete", donationRequestController.completeDonation);

// Get donation requests for a school
router.get(
  "/schools/:schoolId",
  donationRequestController.getDonationRequestsForSchool
);

// Get donation requests for a donor
router.get(
  "/donors/:donorId",
  donationRequestController.getDonationRequestsForDonor
);

module.exports = router;
