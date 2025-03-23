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
  deleteNotification,
  getActiveDonors,
  getDonorReports,
} = require("../controllers/donorController");
const { protect } = require("../middleware/authMiddleware");

// donation request routes
router.put("/:donorId/approve", approveDonationRequest);
router.put("/:donorId/complete", completeDonation);
router.get("/:donorId", getDonorDetails);
router.get("/active-donors", getActiveDonors);
router.get("/:donorId/donations", protect, getDonorDonations);
router.get("/:donorId/reports", getDonorReports);

// notifications routes
router.get("/:donorId/notifications", getDonorNotifications);
router.put("/:donorId/notifications/read", markNotificationsAsRead);
router.delete(
  "/:donorId/notifications/:notificationId",
  protect,
  deleteNotification
);

router.get("/notifications", protect, getCurrentUserNotifications);

module.exports = router;
