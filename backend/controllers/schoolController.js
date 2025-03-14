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
  const { donationNeeds, customRequest } = req.body;

  try {
    // Check if the school exists
    const school = await User.findById(schoolId); // Use _id directly
    console.log("Received School ID:", schoolId);
    console.log("Found School:", school);

    if (!school || school.role !== "School") {
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
      customRequest: customRequest || null,
      status: "Pending",
    });
    await donationRequest.save();

    // Send notifications to donors
    //await sendNotificationToDonors(schoolId, donationNeeds, customRequest);

    try {
      await sendNotificationToDonors(schoolId, donationNeeds, customRequest);
    } catch (notificationError) {
      console.error("Failed to send notifications:", notificationError);
      // We'll continue with success response since the donation request was created
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
    // Fetch the school details
    const school = await User.findById(schoolId);
    if (!school) {
      throw new Error("School not found");
    }

    // Prepare the notification message with school name and location
    const notificationMessage =
      `New donation request from ${school.schoolName} (${
        school.location
      }): ${donationNeeds.join(", ")}` +
      (customRequest ? `\nCustom Request: ${customRequest}` : "");

    // Fetch all donors from the database
    const donors = await User.find({ role: "Donor" });
    console.log(`Found ${donors.length} donors to notify`);

    const updatePromises = donors.map((donor) => {
      console.log(
        `Sending notification to donor: ${donor._id}, role: ${donor.role}`
      );
      return User.findByIdAndUpdate(
        donor._id,
        {
          $push: {
            notifications: {
              schoolId,
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
