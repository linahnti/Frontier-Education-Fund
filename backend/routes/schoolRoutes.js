const express = require("express");
const {
  updateSchoolNeeds,
  updateDonationNeeds,
  getSchoolDetails,
  getAllSchools,
} = require("../controllers/schoolController");

const router = express.Router();

router.put("/:schoolId/needs", updateSchoolNeeds);

router.post("/:schoolId/donation-needs", updateDonationNeeds);

router.get("/:schoolId", getSchoolDetails);

router.get("/", getAllSchools);



module.exports = router;
