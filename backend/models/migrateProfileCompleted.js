const mongoose = require("mongoose");

// Connect to your MongoDB database
mongoose.connect("mongodb://localhost:27017/FrontierEducationFund", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the User model (ensure it uses the updated schema)
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
      enum: ["donor", "admin", "school"], // Allowed values
      required: true,
    },
    isProfileComplete: { type: Boolean, default: false }, // Updated field name
    verified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    discriminatorKey: "role", // Use "role" as the discriminator key
  }
);

const User = mongoose.model("User", userSchema);

// Migration function
const migrateProfileCompletedField = async () => {
  try {
    // Find all users with the old field (`profileCompleted`)
    const users = await User.find({ profileCompleted: { $exists: true } });

    // Update each user
    for (const user of users) {
      // Normalize the role field
      if (user.role === "School") {
        user.role = "school"; // Convert "School" to "school"
      } else if (user.role === "Donor") {
        user.role = "donor"; // Convert "Donor" to "donor"
      }

      // Copy the value of `profileCompleted` to `isProfileComplete`
      user.isProfileComplete = user.profileCompleted;

      // Remove the old field
      user.profileCompleted = undefined; // Explicitly remove the field

      // Save the updated document
      await user.save();
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    mongoose.connection.close(); // Close the database connection
  }
};

// Run the migration
migrateProfileCompletedField();
