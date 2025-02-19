const mongoose = require("mongoose");
const User = require("./user"); // Import the base User model

// School schema
const schoolSchema = new mongoose.Schema({
  // School-specific fields
  schoolName: { type: String, default: "" },
  location: { type: String, default: "" },
  needs: { type: [String], default: [] },
  principalName: { type: String, default: "" },
  schoolType: { type: String, enum: ["public", "private"], default: "" },
  numStudents: { type: Number, min: 1, default: "" },
  accreditation: { type: Boolean, default: false },
  website: { type: String, default: "" },
  missionStatement: { type: String, maxlength: 500, default: "" },
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
});

// Create School discriminator
const School = User.discriminator("School", schoolSchema);

// Export School discriminator
module.exports = School;
