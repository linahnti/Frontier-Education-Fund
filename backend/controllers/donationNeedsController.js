const User = require("../models/user");
const DonationRequest = require("../models/donationRequest");

const updateDonationNeeds = async (req, res) => {
  const { schoolId } = req.params;
  const { donationNeeds, customRequest } = req.body;

  try {
    // Update the school's donationNeeds field
    const school = await User.findByIdAndUpdate(
      schoolId, // Use _id directly
      { $addToSet: { donationNeeds: { $each: donationNeeds } } },
      { new: true }
    );

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    // Create a new donation request
    const donationRequest = new DonationRequest({
      schoolId,
      items: donationNeeds,
      customRequest: customRequest || null,
      status: "Pending",
    });
    await donationRequest.save();

    res
      .status(200)
      .json({ message: "Donation needs updated successfully", school });
  } catch (error) {
    res.status(500).json({ message: "Error updating donation needs", error });
  }
};

module.exports = { updateDonationNeeds };
