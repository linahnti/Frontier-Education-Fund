const mongoose = require("mongoose");
const User = require("../models/user");
const Donor = require("../models/donorDiscriminator");
const DonationRequest = require("../models/donationRequest");
const { request } = require("express");

const getAllDonations = async (req, res) => {
  try {
    const donors = await Donor.find()
      .populate("donationsMade.schoolId", "name schoolName") // Populate school name and schoolName
      .populate("donationsMade.donorId", "name"); // Populate donor name

    // Extract donations from all donors
    const donations = donors.flatMap((donor) =>
      donor.donationsMade.map((donation) => ({
        ...donation.toObject(),
        donorId: donation.donorId, // Include populated donorId
        schoolId: donation.schoolId, // Include populated schoolId
      }))
    );

    console.log("Donations:", donations);

    res.status(200).json(donations);
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).json({ message: "Error fetching donations", error });
  }
};

// Fetch all schools
const getAllSchools = async (req, res) => {
  try {
    const schools = await User.find({ role: "School" });
    res.status(200).json(schools);
  } catch (error) {
    console.error("Error fetching schools:", error);
    res.status(500).json({ message: "Error fetching schools", error });
  }
};

// Fetch all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users", error });
  }
};

const approveDonation = async (req, res) => {
  const { donationId } = req.params;

  try {
    const currentDate = new Date();

    const donor = await Donor.findOneAndUpdate(
      { "donationsMade._id": donationId },
      {
        $set: {
          "donationsMade.$.status": "Approved",
          "donationsMade.$.approvalDate": currentDate,
        },
      },
      { new: true }
    );

    if (!donor) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Find the updated donation
    const updatedDonation = donor.donationsMade.find(
      (donation) => donation._id.toString() === donationId
    );

    // Update the donation status in the school's donationsReceived array
    const school = await mongoose
      .model("School")
      .findById(updatedDonation.schoolId);
    if (school) {
      const schoolDonation = school.donationsReceived.find(
        (donation) => donation.donorId.toString() === donor._id.toString()
      );
      if (schoolDonation) {
        schoolDonation.status = "Approved";
        schoolDonation.approvalDate = currentDate;
      }

      // Send a notification to the school
      console.log("Adding notification to school:", school._id);
      const notification = {
        message: `Your donation request from ${donor.name} has been approved.`,
        type: "approval",
        date: new Date(),
        read: false,
        donationId: updatedDonation._id,
      };

      console.log("Adding notification:", notification);
      school.notifications.push(notification);
      await school.save();
      console.log("Notification saved successfully");
    }

    // Populate the school name and include donation details in the notification
    const schoolName = school ? school.schoolName : "Unknown School";

    let donationDetails;
    if (updatedDonation.type === "money") {
      donationDetails = `KES ${updatedDonation.amount}`;
    } else if (updatedDonation.type === "items") {
      donationDetails = updatedDonation.items.join(", ");
    }

    // Send a notification to the donor
    const donorUser = await User.findById(donor._id);
    if (donorUser) {
      donorUser.notifications.push({
        message: `Your donation of ${donationDetails} to ${schoolName} has been approved.`,
        schoolName: schoolName, // Include the school name
        type: "approval", // Add this field
        date: new Date(),
        read: false,
      });
      await donorUser.save();
    }

    res.status(200).json({
      message: "Donation approved successfully",
      donation: updatedDonation,
    });
  } catch (error) {
    console.error("Error approving donation:", error);
    res.status(500).json({ message: "Error approving donation", error });
  }
};

const deleteDonation = async (req, res) => {
  const { donationId } = req.params;

  try {
    // Find the donor and remove the donation from their donationsMade array
    const donor = await Donor.findOneAndUpdate(
      { "donationsMade._id": donationId },
      { $pull: { donationsMade: { _id: donationId } } },
      { new: true }
    );

    if (!donor) {
      return res.status(404).json({ message: "Donation not found" });
    }

    res.status(200).json({ message: "Donation deleted successfully" });
  } catch (error) {
    console.error("Error deleting donation:", error);
    res.status(500).json({ message: "Error deleting donation", error });
  }
};

const completeDonation = async (req, res) => {
  const { donationId } = req.params;

  try {
    const currentDate = new Date();

    const donor = await Donor.findOneAndUpdate(
      { "donationsMade._id": donationId },
      {
        $set: {
          "donationsMade.$.status": "Completed",
          "donationsMade.$.completionDate": currentDate,
        },
      },
      { new: true }
    );

    if (!donor) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Find the updated donation
    const updatedDonation = donor.donationsMade.find(
      (donation) => donation._id.toString() === donationId
    );

    // Update the donation status in the school's donationsReceived array
    const school = await User.findById(updatedDonation.schoolId);
    if (school && school.role === "School") {
      const schoolDonation = school.donationsReceived.find(
        (donation) => donation.donorId.toString() === donor._id.toString()
      );
      if (schoolDonation) {
        schoolDonation.status = "Completed";
        schoolDonation.completionDate = currentDate;
      }

      // Send a notification to the school
      const notification = {
        message: `Your donation request from ${donor.name} has been completed.`, // REQUIRED field
        type: "completion",
        date: new Date(),
        read: false,
        donorId: donor._id, // Reference to donor
        donationId: updatedDonation._id, // Reference to donation
      };

      console.log("Adding notification to school:", notification);

      school.notifications.push(notification);

      await school.save();
    }

    // Populate the school name and include donation details in the notification
    const schoolName = school ? school.schoolName : "Unknown School";

    let donationDetails;
    if (updatedDonation.type === "money") {
      donationDetails = `KES ${updatedDonation.amount}`;
    } else if (updatedDonation.type === "items") {
      donationDetails = updatedDonation.items.join(", ");
    }

    // Send a notification to the donor
    const donorUser = await User.findById(donor._id);
    if (donorUser) {
      donorUser.notifications.push({
        message: `Your donation of ${donationDetails} to ${schoolName} has been completed. Thank you for your contribution!`,
        schoolName: schoolName,
        type: "completion",
        date: new Date(),
        read: false,
      });
      await donorUser.save();
    }

    res.status(200).json({
      message: "Donation completed successfully",
      donation: updatedDonation,
    });
  } catch (error) {
    console.error("Error completing donation:", error);
    res.status(500).json({ message: "Error completing donation", error });
  }
};

const getAllDonationRequests = async (req, res) => {
  try {
    const donationRequests = await DonationRequest.find()
      .populate("schoolId", "schoolName location") // Populate school details
      .populate("donors.donorId", "name"); // Populate donor details (if needed)

    // Check if donation requests were found
    if (!donationRequests || donationRequests.length === 0) {
      return res.status(404).json({ message: "No donation requests found" });
    }

    // Return the donation requests
    res.status(200).json(donationRequests);
  } catch (error) {
    console.error("Error fetching donation requests:", error);
    res.status(500).json({
      message: "Error fetching donation requests",
      error: error.message,
    });
  }
};

// Approve a donation request
const approveDonationRequest = async (req, res) => {
  const { requestId } = req.params;
  const currentDate = new Date();

  try {
    const donationRequest = await DonationRequest.findByIdAndUpdate(
      requestId,
      {
        $set: {
          status: "Approved",
          requestApprovalDate: currentDate,
        },
      },
      { new: true }
    ).populate("schoolId", "schoolName location donationNeeds");

    if (!donationRequest) {
      return res.status(404).json({ message: "Donation request not found" });
    }

    const school = await mongoose
      .model("School")
      .findById(donationRequest.schoolId._id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    const notification = {
      message: `Your donation request for ${
        Array.isArray(donationRequest.donationNeeds)
          ? donationRequest.donationNeeds.join(", ")
          : "items"
      } has been approved.`,
      type: "approval",
      date: new Date(),
      read: false,
      donationId: donationRequest._id,
    };

    console.log("Adding notification to school:", notification);

    await mongoose
      .model("School")
      .findByIdAndUpdate(donationRequest.schoolId._id, {
        $push: {
          notifications: notification,
        },
      });

    // school.notifications.push(notification);
    // await school.save();

    if (donationRequest.donorId) {
      await User.findByIdAndUpdate(donationRequest.donorId, {
        $push: {
          notifications: {
            message: `Your donation to ${
              donationRequest.schoolId.schoolName
            } for ${
              Array.isArray(donationRequest.donationNeeds)
                ? donationRequest.donationNeeds.join(", ")
                : "items"
            } has been approved.`,
            type: "request_approval",
            date: new Date(),
            read: false,
          },
        },
      });
    }

    res.status(200).json({
      message: "Donation request approved successfully",
      donationRequest,
    });
  } catch (error) {
    console.error("Error approving donation request:", error);
    res
      .status(500)
      .json({ message: "Error approving donation request", error });
  }
};

const completeDonationRequest = async (req, res) => {
  const { requestId } = req.params;
  const currentDate = new Date();

  try {
    const donationRequest = await DonationRequest.findByIdAndUpdate(
      requestId,
      {
        $set: {
          status: "Completed",
          requestCompletionDate: currentDate,
        },
      },
      { new: true }
    ).populate("schoolId", "schoolName location");

    if (!donationRequest) {
      return res.status(404).json({ message: "Donation request not found" });
    }

    const school = await mongoose
      .model("School")
      .findById(donationRequest.schoolId._id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    const notification = {
      message: `Your donation request for ${donationRequest.donationNeeds.join(
        ", "
      )} has been completed.`,
      type: "completion",
      date: new Date(),
      read: false,
      donationId: donationRequest._id,
    };

    school.notifications.push(notification);
    await school.save();
    console.log("Completion notification sent to school:", school._id);

    // Send notification to the donor (if donorId exists)
    if (donationRequest.donorId) {
      const donor = await User.findById(donationRequest.donorId);
      if (donor) {
        donor.notifications.push({
          message: `Your donation to ${donationRequest.schoolId.schoolName} has been completed.`,
          type: "completion",
          date: new Date(),
          read: false,
        });
        await donor.save();
        console.log("Completion notification sent to donor:", donor._id);
      }
    }

    res.status(200).json({
      message: "Donation request completed successfully",
      donationRequest,
    });
  } catch (error) {
    console.error("Error completing donation request:", error);
    res
      .status(500)
      .json({ message: "Error completing donation request", error });
  }
};

// Delete a donation request
const deleteDonationRequest = async (req, res) => {
  const { requestId } = req.params;

  try {
    const donationRequest = await DonationRequest.findByIdAndDelete(requestId);

    if (!donationRequest) {
      return res.status(404).json({ message: "Donation request not found" });
    }

    res.status(200).json({ message: "Donation request deleted successfully" });
  } catch (error) {
    console.error("Error deleting donation request:", error);
    res.status(500).json({ message: "Error deleting donation request", error });
  }
};

const rejectDonationRequest = async (req, res) => {
  const { requestId } = req.params;
  const currentDate = new Date();

  try {
    const donationRequest = await DonationRequest.findByIdAndUpdate(
      requestId,
      {
        $set: {
          status: "Rejected",
          requestRejectionDate: currentDate,
        },
      },
      { new: true }
    ).populate("schoolId", "schoolName location");

    if (!donationRequest) {
      return res.status(404).json({ message: "Donation request not found" });
    }

    // Send notification to the school
    await User.findByIdAndUpdate(donationRequest.schoolId._id, {
      $push: {
        notifications: {
          message: `Your donation request for ${donationRequest.donationNeeds.join(
            ", "
          )} has been rejected.`,
          type: "request_rejection",
          date: new Date(),
          read: false,
        },
      },
    });

    // Send notification to the donor (if donorId exists)
    if (donationRequest.donorId) {
      await User.findByIdAndUpdate(donationRequest.donorId, {
        $push: {
          notifications: {
            message: `Your donation to ${
              donationRequest.schoolId.schoolName
            } for ${donationRequest.donationNeeds.join(
              ", "
            )} has been rejected.`,
            type: "request_rejection",
            date: new Date(),
            read: false,
          },
        },
      });
    }

    res.status(200).json({
      message: "Donation request rejected successfully",
      donationRequest,
    });
  } catch (error) {
    console.error("Error rejecting donation request:", error);
    res
      .status(500)
      .json({ message: "Error rejecting donation request", error });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user", error });
  }
};

const getSchoolRegistrationStats = async (req, res) => {
  try {
    const schools = await User.find({ role: "School" });
    const stats = Array(12).fill(0);
    
    schools.forEach(school => {
      const month = new Date(school.createdAt).getMonth();
      stats[month]++;
    });

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching registration stats", error });
  }
};

module.exports = {
  getAllDonations,
  getAllSchools,
  getAllUsers,
  approveDonation,
  deleteDonation,
  completeDonation,
  getAllDonationRequests,
  approveDonationRequest,
  completeDonationRequest,
  deleteDonationRequest,
  rejectDonationRequest,
  updateUser,
  getSchoolRegistrationStats,
};
