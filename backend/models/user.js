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
      trim: true,
      lowercase: true,
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
      required: true,
    },
    // Fields for donor profile completion
    preferences: {
      type: [String], // Donor's interests, e.g., "education", "health"
      default: [],
    },
    contactNumber: {
      type: String, // We use String to handle leading zeros
      validate: {
        validator: function (value) {
          // Regular expression to match exactly 10 digits
          return /^\d{10}$/.test(value);
        },
        message:
          "Phone number must be exactly 10 digits and contain only numbers.",
      },
      required: [true, "Phone number is required"], // Optional but recommended
    },

    // Fields for school profile completion
    schoolName: {
      type: String, // Required for schools
    },
    location: {
      type: String, // Required for schools
    },
    needs: {
      type: [String], // List of needs, e.g., "books", "uniforms"
      default: [],
    },
    // Common field for profile completion status
    profileCompleted: {
      type: Boolean,
      default: false, // Defaults to false until completed
    },
    profilePicture: {
      type: String,
      default: null,
    },
    address: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    socialLinks: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

userSchema.methods.isProfileComplete = function () {
  if (this.role === "donor") {
    return !!(this.contactNumber && this.preferences.length > 0);
  }
  if (this.role === "school") {
    return !!(this.schoolName && this.location && this.needs.length > 0);
  }
  return true;
};

userSchema.pre("save", function (next) {
  this.profileCompleted = this.isProfileComplete();
  next();
});

// Export User model
module.exports = mongoose.model("User", userSchema);
