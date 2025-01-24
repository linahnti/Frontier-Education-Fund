const express = require("express");
const { registerUser, loginUser } = require("/controllers/userController.js");
const { protect } = require("/middleware/authMiddleware.js");
const router = express.Router();

router.post("/register", registerUser); // Route for user registration
router.post("/login", loginUser); // Route for user login
router.get("/profile", protect, getUserProfile); // Protected route for user profile

module.exports = router;
