const mongoose = require("mongoose");
const User = require("../models/user");
const Donor = require("../models/donorDiscriminator");
const DonationRequest = require("../models/donationRequest");

// Update school needs (for profile page)
const updateSchoolNeeds = async (req, res) => {
  const { schoolId } = req.params;
  const { needs } = req.body;

  // Validate schoolId
  if (!schoolId || !mongoose.Types.ObjectId.isValid(schoolId)) {
    return res.status(400).json({ message: "Invalid school ID" });
  }

  try {
    const school = await User.findByIdAndUpdate(
      schoolId,
      { $set: { needs } },
      { new: true }
    );

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    res
      .status(200)
      .json({ message: "School needs updated successfully", school });
  } catch (error) {
    res.status(500).json({ message: "Error updating school needs", error });
  }
};

// Update donation needs (for donation request component)
const updateDonationNeeds = async (req, res) => {
  const { schoolId } = req.params;
  const { donationNeeds, customRequest } = req.body;

  // Validate schoolId
  if (!schoolId || !mongoose.Types.ObjectId.isValid(schoolId)) {
    return res.status(400).json({ message: "Invalid school ID" });
  }

  try {
    const school = await User.findById(schoolId);
    if (!school || school.role !== "School") {
      return res.status(404).json({ message: "School not found" });
    }

    if (!Array.isArray(donationNeeds)) {
      return res
        .status(400)
        .json({ message: "donationNeeds must be an array" });
    }

    const donationRequest = new DonationRequest({
      schoolId,
      donationNeeds,
      customRequest: customRequest || null,
      status: "Pending",
    });
    await donationRequest.save();

    try {
      await sendNotificationToDonors(schoolId, donationNeeds, customRequest);
    } catch (notificationError) {
      console.error("Failed to send notifications:", notificationError);
    }

    res.status(200).json({
      message: "Donation needs updated successfully",
      donationRequest,
    });
  } catch (error) {
    console.error("Error updating donation needs:", error);
    res
      .status(500)
      .json({ message: "Error updating donation needs", error: error.message });
  }
};

// Helper function to send notifications to donors
const sendNotificationToDonors = async (
  schoolId,
  donationNeeds,
  customRequest
) => {
  try {
    const school = await User.findById(schoolId);
    if (!school) {
      throw new Error("School not found");
    }

    const notificationMessage =
      `New donation request from ${school.schoolName} (${
        school.location
      }): ${donationNeeds.join(", ")}` +
      (customRequest ? `\nCustom Request: ${customRequest}` : "");

    const donors = await User.find({ role: "Donor" });
    console.log(`Found ${donors.length} donors to notify`);

    const updatePromises = donors.map(async (donor) => {
      const updatedDonor = await Donor.findByIdAndUpdate(
        donor._id,
        {
          $push: {
            notifications: {
              schoolId,
              schoolName: school.schoolName,
              message: notificationMessage,
              date: new Date(),
              read: false,
            },
          },
        },
        { new: true }
      );

      console.log(
        `Updated donor ${donor._id} with notifications:`,
        updatedDonor.notifications
      );
    });

    await Promise.all(updatePromises);
    console.log("Notifications sent to all donors.");
  } catch (error) {
    console.error("Error sending notifications:", error);
    throw error;
  }
};

// Get school details (including donations received)
const getSchoolDetails = async (req, res) => {
  const { schoolId } = req.params;

  // Validate schoolId
  if (!schoolId || !mongoose.Types.ObjectId.isValid(schoolId)) {
    return res.status(400).json({ message: "Invalid school ID" });
  }

  try {
    const school = await User.findById(schoolId).populate("donationsReceived");
    res.status(200).json(school);
  } catch (error) {
    res.status(500).json({ message: "Error fetching school details", error });
  }
};

// Get all schools
const getAllSchools = async (req, res) => {
  try {
    const schools = await User.find({ role: "School" }).select(
      "schoolName contactNumber principalName location"
    );
    res.status(200).json(schools);
  } catch (error) {
    res.status(500).json({ message: "Error fetching schools", error });
  }
};

// Get donations received by a school
const getDonationsReceived = async (req, res) => {
  const { schoolId } = req.params;

  // Validate schoolId
  if (!schoolId || !mongoose.Types.ObjectId.isValid(schoolId)) {
    return res.status(400).json({ message: "Invalid school ID" });
  }

  try {
    const school = await User.findById(schoolId).populate({
      path: "donationsReceived",
      populate: { path: "donorId", select: "name email" },
    });

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    res.status(200).json(school.donationsReceived || []);
  } catch (error) {
    console.error("Error fetching donations received:", error);
    res
      .status(500)
      .json({ message: "Error fetching donations received", error });
  }
};

/// Get all donation requests for a school (regardless of status)
const getDonationRequests = async (req, res) => {
  const { schoolId } = req.params;

  // Validate schoolId
  if (!schoolId || !mongoose.Types.ObjectId.isValid(schoolId)) {
    return res.status(400).json({ message: "Invalid school ID" });
  }

  try {
    const donationRequests = await DonationRequest.find({ schoolId })
      .populate("schoolId", "schoolName location")
      .populate("donors.donorId", "name email");

    res.status(200).json(donationRequests);
  } catch (error) {
    console.error("Error fetching donation requests:", error);
    res
      .status(500)
      .json({ message: "Error fetching donation requests", error });
  }
};

// Get active donors for a school
const getActiveDonors = async (req, res) => {
  const { schoolId } = req.params;

  // Validate schoolId
  if (!schoolId || !mongoose.Types.ObjectId.isValid(schoolId)) {
    return res.status(400).json({ message: "Invalid school ID" });
  }

  try {
    const activeDonors = await User.find({
      role: "Donor",
      "donationsMade.schoolId": schoolId,
    }).select("name email donationsMade");

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

const getSchoolNotifications = async (req, res) => {
  const { schoolId } = req.params;

  try {
    const school = await User.findById(schoolId);
    if (!school || school.role !== "School") {
      return res.status(404).json({ message: "School not found" });
    }

    res.status(200).json({ notifications: school.notifications || [] });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications", error });
  }
};

const getSchoolReports = async (req, res) => {
  const { schoolId } = req.params;

  try {
    // Get school with populated donations
    const school = await User.findById(schoolId).populate({
      path: "donationsReceived.donorId",
      select: "name",
    });

    if (!school || school.role !== "School") {
      return res.status(404).json({ message: "School not found" });
    }

    // Get donation requests
    const donationRequests = await DonationRequest.find({ schoolId })
      .populate("schoolId", "schoolName location")
      .populate("donors.donorId", "name");

    // Structure the reports with proper filtering
    const reports = {
      pendingDonations: school.donationsReceived
        .filter((d) => d.status === "Pending")
        .map((d) => ({
          donorName: d.donorId?.name || "Unknown Donor",
          item: d.item,
          status: d.status,
          date: d.date,
          _id: d._id,
        })),
      approvedDonations: school.donationsReceived
        .filter((d) => d.status === "Approved")
        .map((d) => ({
          donorName: d.donorId?.name || "Unknown Donor",
          item: d.item,
          status: d.status,
          date: d.approvalDate || d.date,
          _id: d._id,
        })),
      receivedDonations: school.donationsReceived
        .filter((d) => d.status === "Completed")
        .map((d) => ({
          donorName: d.donorId?.name || "Unknown Donor",
          item: d.item,
          status: d.status,
          date: d.completionDate || d.date,
          _id: d._id,
        })),
      pendingRequests: donationRequests
        .filter((r) => r.status === "Pending")
        .map((r) => ({
          donationNeeds: r.donationNeeds,
          status: r.status,
          date: r.date,
          _id: r._id,
        })),
      approvedRequests: donationRequests
        .filter((r) => r.status === "Approved")
        .map((r) => ({
          donationNeeds: r.donationNeeds,
          status: r.status,
          date: r.requestApprovalDate || r.date,
          _id: r._id,
        })),
      completedRequests: donationRequests
        .filter((r) => r.status === "Completed")
        .map((r) => ({
          donationNeeds: r.donationNeeds,
          status: r.status,
          date: r.requestCompletionDate || r.date,
          _id: r._id,
        })),
    };

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching school reports", error });
  }
};

const getDonorsForMessaging = async (req, res) => {
  const { schoolId } = req.params;

  try {
    const donors = await User.aggregate([
      { $match: { role: "Donor" } },
      { $unwind: "$donationsMade" },
      {
        $match: { "donationsMade.schoolId": mongoose.Types.ObjectId(schoolId) },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          email: { $first: "$email" },
        },
      },
    ]);

    res.status(200).json(donors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching donors", error });
  }
};

module.exports = {
  updateSchoolNeeds,
  updateDonationNeeds,
  getSchoolDetails,
  getAllSchools,
  getDonationsReceived,
  getDonationRequests,
  getActiveDonors,
  getSchoolNotifications,
  getSchoolReports,
  getDonorsForMessaging,
};
