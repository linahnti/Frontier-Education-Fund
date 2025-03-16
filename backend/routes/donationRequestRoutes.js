const express = require("express");
const DonationRequest = require("../models/donationRequest");
const {
  createDonationRequest,
  approveDonationRequest,
  completeDonation,
  getDonationRequestsForSchool,
  getDonationRequestsForDonor,
} = require("../controllers/donationRequestController");

const router = express.Router();

router.post("/requests", createDonationRequest);

router.put("/:requestId/approve", approveDonationRequest);

router.put("/:requestId/complete", completeDonation);

router.get("/school/:schoolId", getDonationRequestsForSchool);

router.get("/donors/:donorId", getDonationRequestsForDonor);

router.get("/", async (req, res) => {
  const { schoolId } = req.query;

  try {
    const donationRequests = await DonationRequest.find({ schoolId });
    res.status(200).json(donationRequests);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching donation requests", error });
  }
});

module.exports = router;
