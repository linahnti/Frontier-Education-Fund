const mongoose = require("mongoose");
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

const getDonorDonations = async (req, res) => {
  const { donorId } = req.params;
  console.log("Fetching donations for donor:", donorId); // Debugging

  try {
    const donor = await User.findById(donorId).populate(
      "donationsMade.schoolId"
    );
    if (!donor || donor.role !== "Donor") {
      console.log("Donor not found or invalid role"); // Debugging
      return res.status(404).json({ message: "Donor not found" });
    }

    console.log("Donations found:", donor.donationsMade); // Debugging
    res.status(200).json(donor.donationsMade);
  } catch (error) {
    console.error("Error fetching donations:", error); // Debugging
    res.status(500).json({ message: "Error fetching donations", error });
  }
};

const getDonorNotifications = async (req, res) => {
  const { donorId } = req.params;

  try {
    const donor = await User.findById(donorId).populate({
      path: "notifications.schoolId",
      select: "schoolName",
    });

    if (!donor || donor.role !== "Donor") {
      return res.status(404).json({ message: "Donor not found" });
    }

    const formattedNotifications = donor.notifications.map((notification) => ({
      ...notification.toObject(),
      schoolName: notification.schoolId?.schoolName || "Unknown School",
    }));

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

    // Fetch the updated donor document to return the updated notifications
    const updatedDonor = await User.findById(donorId);
    res.status(200).json({
      message: "Notifications marked as read",
      notifications: updatedDonor.notifications,
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

const deleteNotification = async (req, res) => {
  const { donorId, notificationId } = req.params;

  try {
    const donor = await User.findById(donorId);
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    // Remove the notification
    donor.notifications = donor.notifications.filter(
      (note) => note._id.toString() !== notificationId
    );

    await donor.save();

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Error deleting notification", error });
  }
};

const getActiveDonors = async (req, res) => {
  try {
    // Fetch all donors who have made at least one donation
    const activeDonors = await User.find({
      role: "Donor",
      donationsMade: { $exists: true, $not: { $size: 0 } }, // Ensure donationsMade array is not empty
    }).select("name email donationsMade"); // Select only necessary fields

    res.status(200).json({
      message: "Active donors fetched successfully",
      activeDonors,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching active donors:", error);
    res.status(500).json({
      message: "Error fetching active donors",
      error: error.message,
    });
  }
};

const getDonorReports = async (req, res) => {
  const { donorId } = req.params;

  try {
    // First find the donor with donationsMade array
    const donor = await User.findById(donorId);

    if (!donor || donor.role !== "Donor") {
      return res.status(404).json({ message: "Donor not found" });
    }

    // Use a direct population approach
    const donorWithPopulatedDonations = await User.findById(donorId)
      .populate({
        path: 'donationsMade.schoolId',
        // Make sure to select all fields you need
        select: 'schoolName name role'
      });

    // Map each donation with correct school name
    const populatedDonations = donorWithPopulatedDonations.donationsMade.map(donation => {
      // Extract school info
      const schoolInfo = donation.schoolId || {};
      
      // Use schoolName only if the document is a School, otherwise fallback to name
      const schoolName = schoolInfo.role === "School" ? (schoolInfo.schoolName || schoolInfo.name) : "N/A";

      return {
        _id: donation._id,
        schoolId: donation.schoolId?._id || donation.schoolId,
        schoolName: schoolName,
        type: donation.type,
        amount: donation.amount,
        items: donation.items,
        status: donation.status,
        date: donation.date,
        approvalDate: donation.approvalDate,
        completionDate: donation.completionDate
      };
    });

    console.log("Populated donations:", populatedDonations);
    res.status(200).json({ donations: populatedDonations });
  } catch (error) {
    console.error("Error fetching donor reports:", error);
    res.status(500).json({ message: "Error fetching donor reports", error });
  }
};

const getSchoolsForMessaging = async (req, res) => {
  try {
    const schools = await User.find({ 
      role: "School", 
      isVerified: true 
    }).select("name email schoolName");

    res.status(200).json(schools);
  } catch (error) {
    res.status(500).json({ message: "Error fetching schools", error });
  }
};

module.exports = {
  approveDonationRequest,
  completeDonation,
  getDonorDetails,
  getDonorDonations,
  getDonorNotifications,
  getCurrentUserNotifications,
  markNotificationsAsRead,
  deleteNotification,
  getActiveDonors,
  getDonorReports,
  getSchoolsForMessaging,
};
