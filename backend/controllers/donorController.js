const User = require("../models/user");
const DonationRequest = require("../models/donationRequest");

// Approve a donation request
const approveDonationRequest = async (req, res) => {
  const { donorId } = req.params;
  const { requestId } = req.body;

  try {
    const donationRequest = await DonationRequest.findByIdAndUpdate(
      requestId,
      {
        $push: { donors: { donorId, status: "Approved" } },
      },
      { new: true }
    );

    res.status(200).json({
      message: "Donation request approved successfully",
      donationRequest,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error approving donation request", error });
  }
};

// Complete a donation
const completeDonation = async (req, res) => {
  const { donorId } = req.params;
  const { requestId } = req.body;

  try {
    const donationRequest = await DonationRequest.findByIdAndUpdate(
      requestId,
      {
        $set: { status: "Completed" },
        $push: { donors: { donorId, status: "Completed" } },
      },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Donation marked as completed", donationRequest });
  } catch (error) {
    res.status(500).json({ message: "Error completing donation", error });
  }
};

// Get donor details (including donations made)
const getDonorDetails = async (req, res) => {
  const { donorId } = req.params;

  try {
    const donor = await User.findById(donorId).populate("donationsMade");
    res.status(200).json(donor);
  } catch (error) {
    res.status(500).json({ message: "Error fetching donor details", error });
  }
};

const getDonorNotifications = async (req, res) => {
  const { donorId } = req.params;

  try {
    const donor = await User.findById(donorId);

    if (!donor || donor.role !== "Donor") {
      return res.status(404).json({ message: "Donor not found" });
    }

    // Return only the notifications array
    res.status(200).json({
      notifications: donor.notifications || [],
      success: true,
    });
  } catch (error) {
    console.error("Error fetching donor notifications:", error);
    res.status(500).json({
      message: "Error fetching donor notifications",
      error: error.message,
    });
  }
};

const getCurrentUserNotifications = async (req, res) => {
  try {
    // Assuming req.user is set by your auth middleware
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      notifications: user.notifications || [],
      success: true,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

// function to mark notifications as read
const markNotificationsAsRead = async (req, res) => {
  const { donorId } = req.params;
  const { notificationIds } = req.body;

  try {
    const donor = await User.findById(donorId);

    if (!donor || donor.role !== "Donor") {
      return res.status(404).json({ message: "Donor not found" });
    }

    // If specific notification IDs are provided, mark only those as read
    if (notificationIds && notificationIds.length > 0) {
      await User.updateOne(
        { _id: donorId },
        {
          $set: {
            "notifications.$[elem].read": true,
          },
        },
        {
          arrayFilters: [{ "elem._id": { $in: notificationIds } }],
          multi: true,
        }
      );
    }
    // Otherwise mark all notifications as read
    else {
      await User.updateOne(
        { _id: donorId },
        { $set: { "notifications.$[].read": true } }
      );
    }

    res.status(200).json({
      message: "Notifications marked as read",
      success: true,
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({
      message: "Error marking notifications as read",
      error: error.message,
    });
  }
};

module.exports = {
  approveDonationRequest,
  completeDonation,
  getDonorDetails,
  getDonorNotifications,
  getCurrentUserNotifications,
  markNotificationsAsRead,
};
