require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");

// 1. Load your User model with proper path resolution
const User = require(path.join(__dirname, "../models/user"));

async function fixExistingDonations() {
  try {
    // 2. Configure MongoDB connection - IMPORTANT!
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/yourdbname";
    if (!mongoUri) {
      throw new Error(
        "MongoDB connection URI is not configured. Please set MONGODB_URI in your .env file"
      );
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 5000,
    });
    console.log("Connected to database");

    // 3. Find only schools that need updates (more efficient)
    const schools = await User.find({
      role: "School",
      "donationsReceived.type": { $exists: false },
    });

    console.log(`Found ${schools.length} schools needing updates`);

    let updatedCount = 0;
    let processedCount = 0;

    // 4. Process in batches for better memory management
    const batchSize = 50;
    for (let i = 0; i < schools.length; i += batchSize) {
      const batch = schools.slice(i, i + batchSize);

      for (const school of batch) {
        processedCount++;
        let needsUpdate = false;

        // 5. Update donations missing type
        const updatedDonations = school.donationsReceived.map((donation) => {
          if (!donation.type) {
            needsUpdate = true;
            return {
              ...donation.toObject(), // Convert Mongoose document to plain object
              type: donation.amount ? "money" : "items",
            };
          }
          return donation;
        });

        if (needsUpdate) {
          school.donationsReceived = updatedDonations;
          await school.save({ validateBeforeSave: false });
          updatedCount++;
          console.log(
            `Updated school ${processedCount}/${schools.length} (ID: ${school._id})`
          );
        }
      }
    }

    console.log(`\nMigration complete! Updated ${updatedCount} schools`);
  } catch (error) {
    console.error("\nError fixing donations:", error.message);
    process.exit(1); // Exit with error code
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed");
    process.exit(0); // Exit with success code
  }
}

// Execute the migration
fixExistingDonations();
