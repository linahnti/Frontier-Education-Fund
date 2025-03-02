const express = require("express");
const schoolController = require("../controllers/schoolController");

const router = express.Router();

// Update school needs (for profile page)
router.put("/:schoolId/needs", schoolController.updateSchoolNeeds);

// Update donation needs (for donation request component)
router.post("/:schoolId/donation-needs", schoolController.updateDonationNeeds);

// Get school details (including donations received)
router.get("/:schoolId", schoolController.getSchoolDetails);

module.exports = router;
