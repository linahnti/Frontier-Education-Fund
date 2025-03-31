const User = require("../models/user");

const createDonation = async (req, res) => {
  const { donorId, schoolId, type, amount, items, preferredDate } = req.body;

  try {
    // Validate the donation amount if the donation type is money
    if (type === "money" && (isNaN(amount) || amount <= 0)) {
      return res.status(400).json({
        message: "Invalid donation amount. Amount must be greater than zero.",
      });
    }

    // Validate items and preferred date for item donations
    if (type === "items") {
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res
          .status(400)
          .json({ message: "Items cannot be empty for item donations." });
      }
      if (!preferredDate || isNaN(new Date(preferredDate).getTime())) {
        return res
          .status(400)
          .json({ message: "Invalid preferred delivery date." });
      }
    }

    const donor = await User.findById(donorId);
    const school = await User.findById(schoolId);

    if (!donor || donor.role !== "Donor") {
      return res
        .status(404)
        .json({ message: "Donor not found or invalid role" });
    }

    if (!school || school.role !== "School") {
      return res
        .status(404)
        .json({ message: "School not found or invalid role" });
    }

    // Create donation object based on type
    const donation = {
      donorId,
      schoolId,
      type,
      status: "Pending",
      date: new Date(),
    };

    if (type === "money") {
      donation.amount = amount;
    } else if (type === "items") {
      donation.items = items;
      donation.delivery = {
        address: school.address, // Use the school's address as the delivery address
        preferredDate: new Date(preferredDate),
        status: "Not Started",
      };
    }

    // Add donation to donor's donationsMade
    donor.donationsMade.push(donation);

    donor.notifications.push({
      message: `Your donation to ${school.schoolName} has been submitted and is pending approval.`,
      schoolName: school.schoolName, // Add this line to include the required schoolName
      type: "donation_submission",
      date: new Date(),
      read: false,
    });

    await donor.save();

    // Add donation to school's donationsReceived
    school.donationsReceived.push({
      donorId,
      item: type === "money" ? `KES ${amount}` : items.join(", "),
      status: "Pending",
      date: new Date(),
    });

    school.notifications.push({
      message: `You received a new donation from ${donor.name}.`,
      type: "new_donation",
      donorId: donor._id,
      date: new Date(),
      read: false,
    });
    await school.save();

    res
      .status(201)
      .json({ message: "Donation created successfully", donation });
  } catch (error) {
    console.error("Error creating donation:", error);
    res.status(500).json({ message: "Error creating donation", error });
  }
};

module.exports = {
  createDonation,
};
