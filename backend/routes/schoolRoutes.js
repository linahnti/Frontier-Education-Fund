const express = require("express");
const {
  updateSchoolNeeds,
  updateDonationNeeds,
  getSchoolDetails,
  getAllSchools,
  getDonationsReceived,
  getDonationRequests,
  getActiveDonors,
  getSchoolNotifications,
  getSchoolReports,
} = require("../controllers/schoolController");

const router = express.Router();

router.put("/:schoolId/needs", updateSchoolNeeds);
router.post("/:schoolId/donation-needs", updateDonationNeeds);
router.get("/:schoolId", getSchoolDetails);
router.get("/", getAllSchools);
router.get("/:schoolId/donations-received", getDonationsReceived);
router.get("/:schoolId/donation-requests", getDonationRequests);
router.get("/:schoolId/active-donors", getActiveDonors);
router.get("/:schoolId/notifications", getSchoolNotifications);
router.get("/:schoolId/reports", getSchoolReports);

module.exports = router;
