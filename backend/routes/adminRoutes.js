const express = require("express");
const router = express.Router();
const {
  getAllDonations,
  getAllSchools,
  getAllUsers,
} = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

// Admin Routes
router.get("/donations", protect, admin, getAllDonations);
router.get("/schools", protect, admin, getAllSchools);
router.get("/users", protect, admin, getAllUsers);

module.exports = router;
