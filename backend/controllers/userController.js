const User = require("../models/user");
const Donor = require("../models/donorDiscriminator");
const School = require("../models/schoolDiscriminator");
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

// Check if Profile is Complete
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user in the database by their ID
    const user = await User.findById(userId).select("-password"); // Exclude password field from response
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Construct the response
    const userProfile = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role, // Ensure role is included
      createdAt: user.createdAt,
    };

    // Add discriminator-specific fields based on the user's role
    if (user.role.toLowerCase() === "donor") {
      userProfile.donorDetails = {
        contactNumber: user.contactNumber || null,
        donorType: user.donorType || null,
        organizationName: user.organizationName || null,
        registrationNumber: user.registrationNumber || null,
        taxExemptStatus: user.taxExemptStatus || null,
        occupation: user.occupation || null,
        donationCategories: user.donationCategories || [],
        annualBudget: user.annualBudget || null,
        donationFrequency: user.donationFrequency || null,
        organizationAffiliation: user.organizationAffiliation || null,
      };
    } else if (user.role.toLowerCase() === "school") {
      userProfile.schoolDetails = {
        schoolName: user.schoolName || null,
        location: user.location || null,
        needs: user.needs || [],
        principalName: user.principalName || null,
        schoolType: user.schoolType || null,
        numStudents: user.numStudents || null,
        accreditation: user.accreditation || null,
        website: user.website || null,
        missionStatement: user.missionStatement || null,
      };
    }

    // Log the profile for debugging
    console.log("User profile:", userProfile);

    // Return the complete user profile
    res.status(200).json(userProfile);
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Update User Profile
const updateUserProfile = async (req, res) => {
  const userId = req.user.id;
  const updatedData = req.body;

  console.log("Received update data:", JSON.stringify(updatedData, null, 2));

  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user profile with the provided data
    user.name = updatedData.name;
    user.email = updatedData.email;
    user.role = updatedData.role; // Ensure role is a string

    if (user.role === "school") {
      user = await School.findByIdAndUpdate(userId, updatedData, { new: true });
    } else if (user.role === "donor") {
      user = await Donor.findByIdAndUpdate(userId, updatedData, { new: true });
    }

    console.log("Updated user profile:", user);

    return res
      .status(200)
      .json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("Error updating profile:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
