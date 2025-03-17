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

module.exports = {
  getAllDonations,
  getAllSchools,
  getAllUsers,
};
