const DonationRequest = require("../models/donationRequest");
const User = require("../models/user");

const createDonationRequest = async (req, res) => {
  const { schoolId, donationNeeds, customRequest } = req.body;

  try {
    // Check if the school exists
    const school = await User.findById(schoolId);
    console.log("Received School ID:", schoolId);
    console.log("Found School:", school);

    if (!school || school.role !== "School") {
      return res.status(404).json({ message: "School not found" });
    }

    // Create a new donation request
    const donationRequest = new DonationRequest({
      schoolId,
      donationNeeds,
      customRequest: customRequest || null,
      status: "Pending",
    });

    await donationRequest.save();

    // Add the donation request to the school's donationRequests array
    await User.findByIdAndUpdate(schoolId, {
      $push: {
        donationRequests: donationRequest._id,
        notifications: {
          message: `Your donation request for ${donationNeeds.join(
            ", "
          )} has been submitted successfully and is pending approval.`,
          type: "request_submission",
          date: new Date(),
          read: false,
        },
      },
    });

    // Send notifications to all donors
    await sendNotificationToDonors(schoolId, donationNeeds, customRequest);

    res.status(201).json({ message: "Donation request created successfully" });
  } catch (error) {
    console.error("Error creating donation request:", error);
    res.status(500).json({ message: "Error creating donation request", error });
  }
};

// Approve a donation request
const approveDonationRequest = async (req, res) => {
  const { requestId } = req.params;
  const { donorId } = req.body;

  try {
    // Check if the donor exists
    const donor = await User.findById(donorId);
    if (!donor || donor.role !== "Donor") {
      // Use capitalized role
      return res.status(404).json({ message: "Donor not found" });
    }

    // Update the donation request with the donor's approval
    const donationRequest = await DonationRequest.findByIdAndUpdate(
      requestId,
      {
        $push: { donors: { donorId, status: "Approved" } },
      },
      { new: true }
    );

    if (!donationRequest) {
      return res.status(404).json({ message: "Donation request not found" });
    }

    // Add the donor to the school's activeDonors array
    await User.findByIdAndUpdate(donationRequest.schoolId, {
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
// Complete a donation
const completeDonation = async (req, res) => {
  const { requestId } = req.params;
  const { donorId } = req.body;

  try {
    // Check if the donor exists
    const donor = await User.findById(donorId);
    if (!donor || donor.role !== "Donor") {
      return res.status(404).json({ message: "Donor not found" });
    }

    // Get the donation request
    const donationRequest = await DonationRequest.findById(requestId);
    if (!donationRequest) {
      return res.status(404).json({ message: "Donation request not found" });
    }

    // Get the school
    const school = await User.findById(donationRequest.schoolId);
    if (!school || school.role !== "School") {
      return res.status(404).json({ message: "School not found" });
    }

    // Update the donation request status to "Completed"
    donationRequest.status = "Completed";
    donationRequest.donors.push({ donorId, status: "Completed" });
    await donationRequest.save();

    // Add the completed donation to the school's donationsReceived array
    const schoolDonation = {
      donorId,
      item: donationRequest.donationNeeds.join(", "),
      status: "Completed",
      date: new Date(),
    };
    school.donationsReceived.push(schoolDonation);

    // Add notification to school
    school.notifications.push({
      message: `Donation request for ${donationRequest.donationNeeds.join(
        ", "
      )} has been completed by ${donor.name}`,
      type: "request_completion",
      date: new Date(),
      read: false,
      donorId: donor._id,
      donorName: donor.name,
    });
    await school.save();

    // Add notification to donor
    donor.notifications.push({
      message: `You completed the donation request for ${donationRequest.donationNeeds.join(
        ", "
      )} to ${school.schoolName || school.name}`,
      type: "donation_completion",
      date: new Date(),
      read: false,
      schoolId: school._id,
      schoolName: school.schoolName || school.name,
    });
    await donor.save();

    res.status(200).json({ message: "Donation marked as completed" });
  } catch (error) {
    res.status(500).json({ message: "Error completing donation", error });
  }
};

// Get donation requests for a school
const getDonationRequestsForSchool = async (req, res) => {
  const { schoolId } = req.params;

  try {
    // Check if the school exists
    const school = await User.findById(schoolId);
    if (!school || school.role !== "School") {
      // Use capitalized role
      return res.status(404).json({ message: "School not found" });
    }

    // Fetch all donation requests for the school
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
  console.log("Fetching donations for donor:", donorId);

  try {
    // Check if the donor exists
    const donor = await User.findById(donorId);
    if (!donor || donor.role !== "Donor") {
      return res
        .status(404)
        .json({ message: "Donor not found or invalid role" });
    }

    // Fetch all donation requests where the donor has participated
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
