const Donor = require("../models/user");
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

    res
      .status(200)
      .json({
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
    const donor = await Donor.findById(donorId).populate("donationsMade");
    res.status(200).json(donor);
  } catch (error) {
    res.status(500).json({ message: "Error fetching donor details", error });
  }
};

module.exports = {
  approveDonationRequest,
  completeDonation,
  getDonorDetails,
};
