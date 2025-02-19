const mongoose = require("mongoose");
const User = require("./user"); // Import the base User model

// Donor schema
const donorSchema = new mongoose.Schema({
  // Donor-specific fields
  contactNumber: {
    type: String,
    validate: {
      validator: function (v) {
        // Allow numbers with a '+' and up to 15 digits
        return /^\+?\d{10,15}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  donorType: {
    type: String,
    enum: ["NGO", "Government", "Individual", "Corporate"],
    default: "",
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
    enum: ["one-time", "monthly", "quarterly", "annually"],
    default: null,
  },
  organizationAffiliation: { type: String, default: "" },
});

// Create Donor discriminator
const Donor = User.discriminator("Donor", donorSchema);

// Export Donor discriminator
module.exports = Donor;
