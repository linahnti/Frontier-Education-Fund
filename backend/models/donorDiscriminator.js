const mongoose = require("mongoose");
const User = require("./user"); // Import the base User model

// Donor schema
const donorSchema = new mongoose.Schema({
  donorType: {
    type: String,
    enum: ["NGO", "Government", "Individual", "Corporate"],
    default: null,
  },
  organizationName: {
    type: String,
    validate: {
      validator: function (value) {
        return this.donorType === "NGO" ||
          this.donorType === "Government" ||
          this.donorType === "Corporate"
          ? !!value
          : true;
      },
      message:
        "Organization name is required for NGOs, Government, and Corporate donors.",
    },
  },
  registrationNumber: {
    type: String,
    validate: {
      validator: function (value) {
        return this.donorType !== "Individual" ? !!value : true;
      },
      message:
        "Registration number is required for NGOs, Government, and Corporate donors.",
    },
  },
  taxExemptStatus: { type: Boolean, default: null },
  occupation: { type: String, default: "" },
  donationCategories: { type: [String], default: [] },
  annualBudget: { type: String, default: null },
  donationFrequency: {
    type: String,
    enum: ["one-time", "Weekly", "Monthly", "Quarterly", "Annually"],
    default: null,
  },
  organizationAffiliation: { type: String, default: "" },

  // Updated fields for donations and notifications
  donationsMade: [
    {
      schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the school
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
  notifications: [
    {
      schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the school
      message: { type: String, requires: true },
      date: { type: Date, default: Date.now }, // Date of the notification
      read: { type: Boolean, default: false }, // Whether the notification has been read
    },
  ],
});
// Create Donor discriminator
const Donor = User.discriminator("Donor", donorSchema);

// Export Donor discriminator
module.exports = Donor;
