const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  checkProfile,
  updateProfile,
} = require("../controllers/userController.js");
const { protect } = require("../middleware/authMiddleware.js");
const {
  verifyProfileCompletion,
} = require("../middleware/profileMiddleware.js");

const router = express.Router();

router.post("/register", registerUser); // Route for user registration
router.post("/login", loginUser); // Route for user login
router.get("/profile", protect, getUserProfile); // Protected route for user profile
router.get("/profile/check", protect, verifyProfileCompletion, (req, res) => {
  res.status(200).json({ message: "Profile is complete!" });
}); // Check if the profile is completed
router.put("/profile/update", protect, updateProfile);

module.exports = router;
