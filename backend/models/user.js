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
      enum: ["donor", "admin", "school"],
      required: true,
    },
    profileCompleted: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    discriminatorKey: "role", // Use "role" as the discriminator key
  }
);

// Base User model
const User = mongoose.model("User", userSchema);
module.exports = User;