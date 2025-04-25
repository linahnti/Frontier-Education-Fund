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
  rejectDonationRequest,
  updateUser,
  getSchoolRegistrationStats,
} = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/donations", protect, admin, getAllDonations);
router.get("/schools", protect, admin, getAllSchools);
router.get("/users", protect, admin, getAllUsers);
router.put("/users/:id", protect, admin, updateUser);
router.put("/donations/:donationId/approve", protect, admin, approveDonation);
router.put("/donations/:donationId/complete", protect, admin, completeDonation);
router.delete("/donations/:donationId", protect, admin, deleteDonation);

router.get("/donation-requests", protect, admin, getAllDonationRequests);
router.put(
  "/donation-requests/:requestId/approve",
  protect,
  admin,
  approveDonationRequest
);
router.put(
  "/donation-requests/:requestId/complete",
  protect,
  admin,
  completeDonationRequest
);
router.put(
  "/donation-requests/:requestId/reject",
  protect,
  admin,
  rejectDonationRequest
);
router.delete(
  "/donation-requests/:requestId",
  protect,
  admin,
  deleteDonationRequest
);
router.get(
  "/school-registration-stats",
  protect,
  admin,
  getSchoolRegistrationStats
);

module.exports = router;
