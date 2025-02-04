const express = require("express");
const router = express.Router();
const {
  requestPasswordReset,
  resetPassword,
} = require("../controllers/forgotPasswordController");

// Route to request password reset (sends an email with a reset link)
router.post("/request", requestPasswordReset);

// Route to handle resetting the password with the token
router.post("/reset/:token", resetPassword);

module.exports = router;
