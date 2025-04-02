const mongoose = require("mongoose");

const donationRequestSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the school (role: "school")
      required: true,
    },
    donationNeeds: { type: [String], default: [] },
    customRequest: { type: String, default: null },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Completed", "Rejected"], // Added "Rejected"
      default: "Pending",
    },
    donors: [
      {
        donorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["Pending", "Approved", "Completed", "Rejected"], // Fixed case consistency
          default: "Pending",
        },
        date: { type: Date, default: Date.now },
      },
    ],
    // New date fields for tracking request lifecycle
    requestApprovalDate: { type: Date }, // When request was approved
    requestCompletionDate: { type: Date }, // When request was completed
    requestRejectionDate: { type: Date }, // When request was rejected
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const DonationRequest =
  mongoose.models.DonationRequest ||
  mongoose.model("DonationRequest", donationRequestSchema);

module.exports = DonationRequest;