const express = require("express");
const router = express.Router();
const {
  approveDonationRequest,
  completeDonation,
  getDonorDetails,
  getDonorDonations,
  getDonorNotifications,
  getCurrentUserNotifications,
  markNotificationsAsRead,
} = require("../controllers/donorController");
const { protect } = require("../middleware/authMiddleware");

// donation request routes
router.put("/:donorId/approve", approveDonationRequest);
router.put("/:donorId/complete", completeDonation);
router.get("/:donorId", getDonorDetails);
router.get("/:donorId/donations", getDonorDonations);

// notifications routes
router.get("/:donorId/notifications", getDonorNotifications);
router.put("/:donorId/notifications/read", markNotificationsAsRead);

// Route for the currently authenticated user
router.get("/notifications", protect, getCurrentUserNotifications);

module.exports = router;
