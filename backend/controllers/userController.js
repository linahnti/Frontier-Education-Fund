const User = require("../models/user.js");
const Donor = require("../models/donorDiscriminator.js");
const School = require("../models/schoolDiscriminator.js");
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

  // Validate email format
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ message: "Please provide a valid email address" });
  }

  // Validate password
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

    // Create the user based on role
    let user;
    if (role === "donor") {
      user = new Donor({
        name,
        email,
        password: hashedPassword,
      });
    } else if (role === "school") {
      user = new School({
        name,
        email,
        password: hashedPassword,
      });
    } else {
      user = new User({
        name,
        email,
        password: hashedPassword,
        role,
      });
    }

    await user.save();

    // Send success response
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Registration error:", error.stack);
    res.status(500).json({
      message: error.message || "Server error. Please try again later.",
    });
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
      expiresIn: "3h",
    });

    // Send success response
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(), // Normalize role to lowercase
        // profileCompleted: user.profileCompleted, // Temporarily exclude this field
      },
    });
  } catch (error) {
    console.error("Login error:", error.stack); // Log the full error stack
    res.status(500).json({
      message: error.message || "Login failed. Please try again.",
    });
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

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};
