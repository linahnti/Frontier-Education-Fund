const mongoose = require("mongoose");
const User = require("./user"); // Import the base User model

// School schema
const schoolSchema = new mongoose.Schema({
  // Existing fields
  schoolName: { type: String, default: "" },
  location: { type: String, default: "" },
  needs: { type: [String], default: [] },
  principalName: { type: String, default: "" },
  schoolType: { type: String, enum: ["public", "private"] },
  numStudents: { type: String },
  accreditation: { type: Boolean, default: false },
  website: { type: String, default: "" },
  missionStatement: { type: String, maxlength: 500, default: "" },

  donationsReceived: [
    {
      donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the donor
      item: { type: String }, // Item donated (e.g., books, desks)
      status: {
        type: String,
        enum: ["Pending", "Approved", "Completed"],
        default: "Pending",
      }, // Status of the donation
      date: { type: Date, default: Date.now }, // Date of the donation
    },
  ],
  donationRequests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DonationRequest", // Reference to the DonationRequest schema
    },
  ],
  activeDonors: [
    {
      donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the donor
      donationsMade: { type: Number, default: 0 }, // Number of donations made by the donor to this school
    },
  ],

  notifications: [
    {
      message: { type: String, required: true },
      type: {
        type: String,
        enum: ["approval", "completion", "rejection", "new_request"],
      },
      date: { type: Date, default: Date.now },
      read: { type: Boolean, default: false },
      // Optional references:
      donationId: { type: mongoose.Schema.Types.ObjectId },
      donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  ],
});

// Create School discriminator
const School = User.discriminator("School", schoolSchema);

// Export School discriminator
module.exports = School;
