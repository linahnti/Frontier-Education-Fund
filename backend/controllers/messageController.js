const Message = require("../models/message");
const User = require("../models/user");
const mongoose = require("mongoose");

// Send a new message
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    // Validate input
    if (!content || !content.trim()) {
      return res
        .status(400)
        .json({ message: "Message content cannot be empty" });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: "Invalid receiver ID" });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // Create new message
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
      read: false,
      createdAt: new Date(),
    });

    await message.save();

    // Increment unreadMessages counter for receiver
    await User.findByIdAndUpdate(receiverId, {
      $inc: { unreadMessages: 1 },
      $push: {
        notifications: {
          message: `New message from ${req.user.name}`,
          type: "message",
          link: `/messages`,
          read: false,
          createdAt: new Date(),
        },
      },
    });

    // Populate sender and receiver info for frontend
    const populatedMessage = await Message.findById(message._id).populate(
      "sender receiver",
      "name role schoolName"
    );

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res
      .status(500)
      .json({ message: "Error sending message", error: error.message });
  }
};

// Get messages between current user and another user
const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Check if other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get messages between the two users
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    })
      .sort("createdAt")
      .populate("sender receiver", "name role schoolName");

    // Mark messages as read when user opens the conversation
    const updateResult = await Message.updateMany(
      {
        sender: otherUserId,
        receiver: userId,
        read: false,
      },
      { read: true }
    );

    // If messages were marked as read, update unreadMessages counter
    if (updateResult.modifiedCount > 0) {
      await User.findByIdAndUpdate(userId, {
        $set: { unreadMessages: 0 },
      });
    }

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res
      .status(500)
      .json({ message: "Error fetching messages", error: error.message });
  }
};

// Get all conversations for the current user
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Convert string ID to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get distinct users you've messaged or who've messaged you with latest message first
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userObjectId }, { receiver: userObjectId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$sender", userObjectId] }, "$receiver", "$sender"],
          },
          lastMessage: { $first: "$content" },
          lastMessageDate: { $first: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$read", false] },
                    { $eq: ["$receiver", userObjectId] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          lastMessageId: { $first: "$_id" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          userId: "$userDetails._id",
          name: "$userDetails.name",
          role: "$userDetails.role",
          schoolName: "$userDetails.schoolName",
          lastMessage: 1,
          lastMessageDate: 1,
          unreadCount: 1,
        },
      },
      {
        $sort: { lastMessageDate: -1 },
      },
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res
      .status(500)
      .json({ message: "Error fetching conversations", error: error.message });
  }
};

// Get count of unread messages
const getUnreadMessagesCount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Count unread messages where the current user is the receiver
    const count = await Message.countDocuments({
      receiver: userId,
      read: false,
    });

    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching unread messages count:", error);
    res.status(500).json({
      message: "Error fetching unread messages count",
      error: error.message,
    });
  }
};

// Mark all messages as read in a conversation
const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const updateResult = await Message.updateMany(
      {
        sender: otherUserId,
        receiver: userId,
        read: false,
      },
      { $set: { read: true } }
    );

    // If messages were marked as read, update unreadMessages counter
    if (updateResult.modifiedCount > 0) {
      await User.findByIdAndUpdate(userId, {
        $set: { unreadMessages: 0 },
      });
    }

    res.status(200).json({
      success: true,
      messagesMarkedAsRead: updateResult.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      message: "Error marking messages as read",
      error: error.message,
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getConversations,
  getUnreadMessagesCount,
  markMessagesAsRead,
};
