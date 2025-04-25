const User = require("../models/user");

const createDonation = async (req, res) => {
  const { donorId, schoolId, type, amount, items, preferredDate } = req.body;

  try {
    if (type === "money" && (isNaN(amount) || amount <= 0)) {
      return res.status(400).json({
        message: "Invalid donation amount. Amount must be greater than zero.",
      });
    }

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

    // Set status based on donation type
    const status = type === "money" ? "Completed" : "Pending";

    const donation = {
      donorId,
      schoolId,
      type,
      status,
      date: new Date(),
    };

    if (type === "money") {
      donation.amount = amount;
    } else if (type === "items") {
      donation.items = items;
      donation.delivery = {
        address: school.address,
        preferredDate: new Date(preferredDate),
        status: "Not Started",
      };
    }

    donor.donationsMade.push(donation);
    await donor.save();

    school.donationsReceived.push({
      donorId,
      item: type === "money" ? `KES ${amount}` : items.join(", "),
      status,
      date: new Date(),
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
