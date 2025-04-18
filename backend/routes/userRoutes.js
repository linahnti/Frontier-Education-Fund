const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  verifyEmail,
  resendVerificationEmail,
} = require("../controllers/userController.js");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/profile", protect, getUserProfile);
router.get("/validate-token", protect, async (req, res) => {
  try {
    res.json({ message: "Token is valid" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/profile/update", protect, updateUserProfile);

router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

module.exports = router;
