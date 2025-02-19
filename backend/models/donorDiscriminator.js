// models/Donor.js
const mongoose = require("mongoose");
const User = require("./user"); // Import the base User model

// Donor schema
const donorSchema = new mongoose.Schema({
  // Donor-specific fields
  contactNumber: {
    type: String,
    validate: {
      validator: function (value) {
        if (!value) return true;
        return /^\d{10}$/.test(value);
      },
      message:
        "Phone number must be exactly 10 digits and contain only numbers.",
    },
  },
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
  occupation: { type: String, default: null },
  donationCategories: { type: [String], default: [] },
  annualBudget: { type: Number, min: 0, default: null },
  donationFrequency: {
    type: String,
    enum: ["one-time", "monthly", "quarterly", "annually"],
    default: null,
  },
  organizationAffiliation: { type: String, default: null },
});

// Create Donor discriminator
const Donor = User.discriminator("Donor", donorSchema);

// Export Donor discriminator
module.exports = Donor;
