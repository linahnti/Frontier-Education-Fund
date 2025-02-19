const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  checkUserProfile,
  updateUserProfile,
} = require("../controllers/userController.js");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected Routes
router.get("/profile", protect, getUserProfile);
router.get("/validate-token", protect, async (req, res) => {
  try {
    res.json({ message: "Token is valid" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
//router.get("/profile/check", protect, checkUserProfile);
router.put("/profile/update", protect, updateUserProfile);

module.exports = router;
