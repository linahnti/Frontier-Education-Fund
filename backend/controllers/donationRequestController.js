const DonationRequest = require("../models/donationRequest");
const School = require("../models/user");

// Create a donation request
const createDonationRequest = async (req, res) => {
  const { schoolId, items } = req.body;

  try {
    const donationRequest = new DonationRequest({ schoolId, items });
    await donationRequest.save();

    await School.findByIdAndUpdate(schoolId, {
      $push: { donationRequests: donationRequest._id },
    });

    res.status(201).json({ message: "Donation request created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating donation request", error });
  }
};

// Approve a donation request
const approveDonationRequest = async (req, res) => {
  const { requestId } = req.params;
  const { donorId } = req.body;

  try {
    const donationRequest = await DonationRequest.findByIdAndUpdate(
      requestId,
      {
        $push: { donors: { donorId, status: "Approved" } },
      },
      { new: true }
    );

    await School.findByIdAndUpdate(donationRequest.schoolId, {
      $addToSet: { activeDonors: donorId },
    });

    res.status(200).json({ message: "Donation request approved successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error approving donation request", error });
  }
};

// Complete a donation
const completeDonation = async (req, res) => {
  const { requestId } = req.params;
  const { donorId } = req.body;

  try {
    const donationRequest = await DonationRequest.findByIdAndUpdate(
      requestId,
      {
        $set: { status: "Completed" },
        $push: { donors: { donorId, status: "Completed" } },
      },
      { new: true }
    );

    await School.findByIdAndUpdate(donationRequest.schoolId, {
      $push: {
        donationsReceived: {
          donorId,
          item: donationRequest.items[0].item, // Example: Use the first item
          status: "Completed",
        },
      },
    });

    res.status(200).json({ message: "Donation marked as completed" });
  } catch (error) {
    res.status(500).json({ message: "Error completing donation", error });
  }
};

// Get donation requests for a school
const getDonationRequestsForSchool = async (req, res) => {
  const { schoolId } = req.params;

  try {
    const donationRequests = await DonationRequest.find({ schoolId });
    res.status(200).json(donationRequests);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching donation requests", error });
  }
};

// Get donation requests for a donor
const getDonationRequestsForDonor = async (req, res) => {
  const { donorId } = req.params;

  try {
    const donationRequests = await DonationRequest.find({
      "donors.donorId": donorId,
    });
    res.status(200).json(donationRequests);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching donation requests", error });
  }
};

module.exports = {
  createDonationRequest,
  approveDonationRequest,
  completeDonation,
  getDonationRequestsForSchool,
  getDonationRequestsForDonor,
};
