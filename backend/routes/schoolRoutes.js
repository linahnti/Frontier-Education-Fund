const express = require("express");
const {
  updateSchoolNeeds,
  updateDonationNeeds,
  getSchoolDetails,
  getAllSchools,
  getDonationsReceived,
  getPendingDonationRequests,
  getActiveDonors,
} = require("../controllers/schoolController");

const router = express.Router();

router.put("/:schoolId/needs", updateSchoolNeeds);
router.post("/:schoolId/donation-needs", updateDonationNeeds);
router.get("/:schoolId", getSchoolDetails);
router.get("/", getAllSchools);
router.get("/:schoolId/donations-received", getDonationsReceived);
router.get("/:schoolId/donation-requests", getPendingDonationRequests);
router.get("/:schoolId/active-donors", getActiveDonors);

module.exports = router;
