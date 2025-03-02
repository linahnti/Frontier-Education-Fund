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
  contactNumber: {
    type: String,
    validate: {
      validator: function (v) {
        return /^\+?\d{10,15}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },

  // Updated fields for donations and requests
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
  activeDonors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // List of donors who have donated to the school

  // New field for notifications
  notifications: [
    {
      donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the donor
      item: { type: String }, // Item donated (e.g., books, desks)
      status: { type: String, enum: ["Pending", "Approved", "Completed"] }, // Status of the donation
      date: { type: Date, default: Date.now }, // Date of the notification
      read: { type: Boolean, default: false }, // Whether the notification has been read
    },
  ],
});

// Create School discriminator
const School = User.discriminator("School", schoolSchema);

// Export School discriminator
module.exports = School;
