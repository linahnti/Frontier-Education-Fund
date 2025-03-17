const mongoose = require("mongoose");
const Donor = require("./donorDiscriminator");
const dbURI = "mongodb://localhost:27017/FrontierEducationFund";

const defaultDonorId = "67cc029c1fa8d91326e3b850";

const updateDonations = async () => {
  try {
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Update donations without donorId
    const result = await Donor.updateMany(
      { "donationsMade.donorId": { $exists: false } },
      { $set: { "donationsMade.$[].donorId": defaultDonorId } }
    );

    console.log("Update completed:", result);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error during update:", error);
  }
};

// Run the update script
updateDonations();
