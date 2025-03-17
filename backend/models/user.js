const mongoose = require("mongoose");

// Base user schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"] },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
      trim: true,
      lowercase: true,
    },
    contactNumber: {
      type: String,
      required: function () {
        return this.role === "Donor" || this.role === "School";
      },
      validate: {
        validator: function (v) {
          if (v) {
            return /^\+\d{12}$/.test(v);
          }
          return true;
        },
        message: (props) =>
          `${props.value} is not a valid contact number! It must start with a country code and be exactly 12 digits (e.g., +254712345678).`,
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      validate: {
        validator: function (value) {
          const strongPasswordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
          return strongPasswordRegex.test(value);
        },
        message:
          "Password must be at least 8 characters long, with at least one uppercase letter, one number, and one special character.",
      },
    },
    role: {
      type: String,
      enum: ["Donor", "Admin", "School"],
      required: true,
    },
    isProfileComplete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    discriminatorKey: "role", // Use "role" as the discriminator key
  }
);

// Base User model
const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;
