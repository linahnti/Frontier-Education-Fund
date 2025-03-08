const User = require("../models/user");
const DonationRequest = require("../models/donationRequest");

// Update school needs (for profile page)
const updateSchoolNeeds = async (req, res) => {
  const { schoolId } = req.params;
  const { needs } = req.body;

  try {
    // Use the User model to update the school document
    const school = await User.findByIdAndUpdate(
      schoolId,
      { $set: { needs } }, // Use $set to update the needs array
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
  const { donationNeeds } = req.body;

  try {
    // Check if the school exists
    const school = await User.findById(schoolId); // Use _id directly
    console.log("Received School ID:", schoolId);
    console.log("Found School:", school);

    if (!school || school.role !== "School") {
      // Ensure role is "School"
      return res.status(404).json({ message: "School not found" });
    }

    // Validate donationNeeds
    if (!Array.isArray(donationNeeds)) {
      return res
        .status(400)
        .json({ message: "donationNeeds must be an array" });
    }

    // Create a new donation request
    const donationRequest = new DonationRequest({
      schoolId,
      donationNeeds,
      status: "Pending",
    });
    await donationRequest.save();

    // Send notifications to donors
    await sendNotificationToDonors(schoolId, donationNeeds);

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
const sendNotificationToDonors = async (schoolId, donationNeeds) => {
  try {
    // Fetch all donors
    const donors = await User.find({ role: "donor" });

    // Send notifications to each donor
    donors.forEach(async (donor) => {
      await User.findByIdAndUpdate(donor._id, {
        $push: {
          notifications: {
            schoolId,
            message: `New donation request: ${donationNeeds.join(", ")}`,
            date: new Date(),
            read: false,
          },
        },
      });
    });
  } catch (error) {
    console.error("Error sending notifications:", error);
  }
};

// Get school details (including donations received)
const getSchoolDetails = async (req, res) => {
  const { schoolId } = req.params;

  try {
    const school = await User.findById(schoolId).populate("donationsReceived");
    res.status(200).json(school);
  } catch (error) {
    res.status(500).json({ message: "Error fetching school details", error });
  }
};

module.exports = {
  updateSchoolNeeds,
  updateDonationNeeds,
  getSchoolDetails,
};
