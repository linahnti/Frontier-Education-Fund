const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  sendMessage,
  getMessages,
  getConversations,
  getUnreadMessagesCount,
  markMessagesAsRead,
} = require("../controllers/messageController");
const { getSchoolsForMessaging } = require("../controllers/donorController");
const { getDonorsForMessaging } = require("../controllers/schoolController");

// Send a new message
router.post("/", protect, sendMessage);

// Get all conversations for the current user
router.get("/conversations", protect, getConversations);

// Get count of unread messages
router.get("/unread-count", protect, getUnreadMessagesCount);

// Get messages between current user and another user
router.get("/:otherUserId", protect, getMessages);

// Mark messages as read
router.patch("/:otherUserId/mark-read", protect, markMessagesAsRead);

// Get schools a donor can message
router.get("/donor/available-schools", protect, getSchoolsForMessaging);

// Get donors a school can message
router.get(
  "/school/available-donors/:schoolId",
  protect,
  getDonorsForMessaging
);

module.exports = router;
