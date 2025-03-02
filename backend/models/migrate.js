const mongoose = require("mongoose");
const User = require("./user");

async function migrate() {
  try {
    // Connect to database
    await mongoose.connect("mongodb://localhost:27017/FrontierEducationFund", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Find all schools and add the new fields
    const schools = await User.find({ role: "school" });
    for (const school of schools) {
      school.donationsReceived = school.donationsReceived || [];
      school.pendingRequests = school.pendingRequests || [];
      school.activeDonors = school.activeDonors || [];
      await school.save();
    }

    // Find all donors and add the new fields
    const donors = await User.find({ role: "donor" });
    for (const donor of donors) {
      donor.donationsMade = donor.donationsMade || [];
      donor.notifications = donor.notifications || [];
      await donor.save();
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    // Disconnect from the database
    await mongoose.disconnect();
  }
}

migrate();
