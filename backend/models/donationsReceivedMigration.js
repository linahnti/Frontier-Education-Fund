const mongoose = require("mongoose");
const User = require("./user");

const migrateDonations = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/FrontierEducationFund");

    // Find all donors and populate the `schoolId` field in `donationsMade`
    const donors = await User.find({ role: "Donor" }).populate({
      path: "donationsMade.schoolId",
      model: "User",
      select: "role", // Only select the role field to verify it's a school
    });

    for (const donor of donors) {
      for (const donation of donor.donationsMade) {
        // Ensure the populated `schoolId` is a valid school
        if (donation.schoolId && donation.schoolId.role === "School") {
          const school = await User.findById(donation.schoolId._id);

          if (school) {
            // Add the donation to the school's `donationsReceived` array
            school.donationsReceived.push({
              donorId: donor._id,
              item:
                donation.type === "money"
                  ? `KES ${donation.amount}`
                  : donation.items.join(", "),
              status: donation.status,
              date: donation.date,
            });

            // Update the school's `activeDonors` array
            const isDonorActive = school.activeDonors.some(
              (activeDonor) =>
                activeDonor.donorId.toString() === donor._id.toString()
            );

            if (!isDonorActive) {
              school.activeDonors.push({ donorId: donor._id, donationsMade: 1 });
            } else {
              const activeDonor = school.activeDonors.find(
                (activeDonor) =>
                  activeDonor.donorId.toString() === donor._id.toString()
              );
              activeDonor.donationsMade += 1;
            }

            await school.save();
          }
        }
      }
    }

    console.log("Donations migrated successfully!");
  } catch (error) {
    console.error("Error migrating donations:", error);
  } finally {
    mongoose.connection.close();
  }
};

migrateDonations();