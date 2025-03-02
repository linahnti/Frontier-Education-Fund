const mongoose = require("mongoose");

const donationRequestSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the school
      required: true,
    },
    items: [
      {
        item: { type: String, required: true }, // Item requested (e.g., books, desks)
        quantity: { type: Number, required: true }, // Quantity of the item
      },
    ],
    donationNeeds: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Completed"],
      default: "Pending",
    },
    donors: [
      {
        donorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Reference to the donor
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
