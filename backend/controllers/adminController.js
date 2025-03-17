const User = require("../models/user");
const Donor = require("../models/donorDiscriminator");

// Fetch all donations
const getAllDonations = async (req, res) => {
  try {
    // Fetch all donors and their donations
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
    // Find the donation and update its status to "Approved"
    const donor = await Donor.findOneAndUpdate(
      { "donationsMade._id": donationId },
      { $set: { "donationsMade.$.status": "Approved" } },
      { new: true }
    );

    if (!donor) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Find the updated donation
    const updatedDonation = donor.donationsMade.find(
      (donation) => donation._id.toString() === donationId
    );

    // Populate the school name and include donation details in the notification
    const school = await User.findById(updatedDonation.schoolId);
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
    // Find the donation and update its status to "Completed"
    const donor = await Donor.findOneAndUpdate(
      { "donationsMade._id": donationId },
      { $set: { "donationsMade.$.status": "Completed" } },
      { new: true }
    );

    if (!donor) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Find the updated donation
    const updatedDonation = donor.donationsMade.find(
      (donation) => donation._id.toString() === donationId
    );

    // Populate the school name and include donation details in the notification
    const school = await User.findById(updatedDonation.schoolId);
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
      .populate("donors.donorId", "name"); // Populate donor details

    res.status(200).json(donationRequests);
  } catch (error) {
    console.error("Error fetching donation requests:", error);
    res
      .status(500)
      .json({ message: "Error fetching donation requests", error });
  }
};

// Approve a donation request
const approveDonationRequest = async (req, res) => {
  const { requestId } = req.params;

  try {
    const donationRequest = await DonationRequest.findByIdAndUpdate(
      requestId,
      { $set: { status: "Approved" } },
      { new: true }
    );

    if (!donationRequest) {
      return res.status(404).json({ message: "Donation request not found" });
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

// Complete a donation request
const completeDonationRequest = async (req, res) => {
  const { requestId } = req.params;

  try {
    const donationRequest = await DonationRequest.findByIdAndUpdate(
      requestId,
      { $set: { status: "Completed" } },
      { new: true }
    );

    if (!donationRequest) {
      return res.status(404).json({ message: "Donation request not found" });
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
};
