const mongoose = require("mongoose");

const donationRequestSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the school (role: "school")
      required: true,
    },
    donationNeeds: { type: [String], default: [] }, // Array of strings for donation needs
    customRequest: { type: String, default: null }, // Optional custom request
    status: {
      type: String,
      enum: ["Pending", "Approved", "Completed"],
      default: "Pending",
    },
    donors: [
      {
        donorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Reference to the donor (role: "donor")
        },
        status: {
          type: String,
          enum: ["Pending", "Approved", "Completed"],
          default: "Pending",
        },
        date: { type: Date, default: Date.now }, // Date of the donor's response
      },
    ],
    date: { type: Date, default: Date.now }, // Date of the request
  },
  { timestamps: true }
);

const DonationRequest =
  mongoose.models.DonationRequest ||
  mongoose.model("DonationRequest", donationRequestSchema);

module.exports = DonationRequest;
