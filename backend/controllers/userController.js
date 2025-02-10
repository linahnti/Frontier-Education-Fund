const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register User
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validate role
  const validRoles = ["admin", "donor", "school"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role provided." });
  }

  // Validation for email format
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ message: "Please provide a valid email address" });
  }

  // Password validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long, with at least one uppercase letter, one number, and one special character.",
    });
  }

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Send success response
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    // Handle server errors
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Please check your email." });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid credentials. Please try again." });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    // Send success response
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Get User Profile (Authenticated)
const getUserProfile = async (req, res) => {
  try {
    // Get the user ID from the token payload (provided by the 'protect' middleware)
    const userId = req.user.id;

    // Find the user in the database by their ID
    const user = await User.findById(userId).select("-password"); // Exclude password field from response
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Return the user profile data
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Check Profile Completion
const checkProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Role-based profile requirements
    const requiredFields = {
      donor: ["phoneNumber", "address"],
      school: ["schoolName", "schoolAddress"],
    };

    const missingFields = requiredFields[user.role]?.filter(
      (field) => !user[field]
    );

    if (missingFields && missingFields.length > 0) {
      return res.status(400).json({
        message: "Profile incomplete",
        missingFields,
      });
    }

    res.status(200).json({ message: "Profile complete" });
  } catch (error) {
    console.error("Check profile error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Role-based validation for allowed fields
    const allowedFields = {
      donor: ["name", "email", "phoneNumber", "address"],
      school: ["name", "email", "schoolName", "schoolAddress"],
      admin: ["name", "email"], // Adjust for admin as needed
    };

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Filter out disallowed fields
    const filteredUpdates = Object.keys(updates).reduce((acc, key) => {
      if (allowedFields[user.role]?.includes(key)) {
        acc[key] = updates[key];
      }
      return acc;
    }, {});

    // Perform the update
    const updatedUser = await User.findByIdAndUpdate(userId, filteredUpdates, {
      new: true,
    }).select("-password"); // Exclude password field

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  checkProfile,
  updateProfile,
};
