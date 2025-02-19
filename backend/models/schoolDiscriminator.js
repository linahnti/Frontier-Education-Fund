const mongoose = require("mongoose");
const User = require("./user"); // Import the base User model

// School schema
const schoolSchema = new mongoose.Schema({
  // School-specific fields
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
        // Allow numbers with a '+' and up to 15 digits
        return /^\+?\d{10,15}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
});

// Create School discriminator
const School = User.discriminator("School", schoolSchema);

// Export School discriminator
module.exports = School;
