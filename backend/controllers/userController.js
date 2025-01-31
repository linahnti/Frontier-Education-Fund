const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register User
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  let errors = [];

  //validation for email format 
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    errors.push("Invalid email format");
  }

  // Password validation 
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (errors.length > 0) {
    return res.status(400).json({ messages: errors });
  }


  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10); // Hash password
    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ id: user._id, name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });
    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error); // Logging the error for debugging
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get User Profile (Authenticated)
const getUserProfile = async (req, res) => {
  try {
    // Get the user ID from the token payload (provided by the 'protect' middleware)
    const userId = req.user.id;

    // Find the user in the database by their ID
    const user = await User.findById(userId).select("-password"); // Exclude password field from response
    if (!user) return res.status(404).json({ message: "User not found" });

    // Return the user profile data
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerUser, loginUser, getUserProfile };
