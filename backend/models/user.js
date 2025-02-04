const mongoose = require("mongoose");

// user schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"] },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      validate: {
        validator: function (value) {
          // Regular expression for strong password: at least one uppercase, one lowercase, one number, one special character
          const strongPasswordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
          return strongPasswordRegex.test(value); // Return true if the password matches the regex
        },
        message:
          "Password must be at least 8 characters long, with at least one uppercase letter, one number, and one special character.",
      },
    },
    role: {
      type: String,
      enum: ["donor", "admin", "school"],
      default: "donor",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Export User model
module.exports = mongoose.model("User", userSchema);
