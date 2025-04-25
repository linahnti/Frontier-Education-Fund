const mongoose = require("mongoose");
const User = require("./user"); 

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

  donationsMade: [
    {
      donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      type: { type: String, enum: ["money", "items"], required: true },
      amount: { type: Number },
      items: [{ type: String }],
      status: {
        type: String,
        enum: ["Pending", "Completed"],
        default: "Pending",
      },
      date: { type: Date, default: Date.now },
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
      schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      schoolName: {
        type: String,
        required: function () {
          return !!this.schoolId;
        },
      },
      message: { type: String, required: true },
      date: { type: Date, default: Date.now },
      read: { type: Boolean, default: false },
      type: {
        type: String,
        enum: [
          "newRequest",
          "approval",
          "completion",
          "donation_submission",
          "request_rejection",
        ],
      },
    },
  ],
  delivery: {
    address: { type: String },
    preferredDate: { type: Date },
    status: {
      type: String,
      enum: ["Not Started", "In Transit", "Delivered"],
      default: "Not Started",
    },
    trackingNumber: { type: String },
  },
  date: { type: Date, default: Date.now },
});

const Donor = User.discriminator("Donor", donorSchema);

module.exports = Donor;
