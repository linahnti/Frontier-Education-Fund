const User = require("../models/user");

const createDonation = async (req, res) => {
  const { donorId, schoolId, type, amount, items } = req.body;

  try {
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
    }

    donor.donationsMade.push(donation);
    await donor.save();

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
