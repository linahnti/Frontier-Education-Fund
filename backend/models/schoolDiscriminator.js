// models/School.js
const mongoose = require("mongoose");
const User = require("./user"); // Import the base User model

// School schema
const schoolSchema = new mongoose.Schema({
  // School-specific fields
  schoolName: { type: String, default: null },
  location: { type: String, default: null },
  needs: { type: [String], default: [] },
  principalName: { type: String, default: null },
  schoolType: { type: String, enum: ["public", "private"], default: null },
  numStudents: { type: Number, min: 1, default: null },
  accreditation: { type: Boolean, default: false },
  website: { type: String, default: null },
  missionStatement: { type: String, maxlength: 500, default: null },
});

// Create School discriminator
const School = User.discriminator("School", schoolSchema);

// Export School discriminator
module.exports = School;