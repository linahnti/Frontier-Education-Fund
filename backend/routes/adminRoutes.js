const express = require("express");
const router = express.Router();
const {
  getAllDonations,
  getAllSchools,
  getAllUsers,
  approveDonation,
  deleteDonation,
  completeDonation,
  getAllDonationRequests,
  approveDonationRequest,
  completeDonationRequest,
  deleteDonationRequest,
} = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/donations", protect, admin, getAllDonations);
router.get("/schools", protect, admin, getAllSchools);
router.get("/users", protect, admin, getAllUsers);
router.put("/donations/:donationId/approve", protect, admin, approveDonation);
router.put("/donations/:donationId/complete", protect, admin, completeDonation);
router.delete("/donations/:donationId", protect, admin, deleteDonation);

router.get("/", protect, admin, getAllDonationRequests);
router.put("/:requestId/approve", protect, admin, approveDonationRequest);
router.put("/:requestId/complete", protect, admin, completeDonationRequest);
router.delete("/:requestId", protect, admin, deleteDonationRequest);

module.exports = router;
