const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

// Create a new notification
const createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, read = false } = req.body;
    
    // Find the user
    const User = require("../models/user");
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Add notification to user's notifications array
    user.notifications.push({
      message,
      type,
      title,
      date: new Date(),
      read
    });
    
    await user.save();
    
    res.status(201).json({ 
      message: "Notification created successfully",
      notification: user.notifications[user.notifications.length - 1]
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: "Error creating notification", error: error.message });
  }
};

router.post("/", protect, createNotification);

module.exports = router;