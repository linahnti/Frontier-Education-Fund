const nodemailer = require("nodemailer");
const User = require("../models/user");
const Donor = require("../models/donorDiscriminator");
const School = require("../models/schoolDiscriminator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const sendVerificationEmail = async (user) => {
  try {
    // Create verification token
    const verificationToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" }
    );

    const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Frontier Education Fund" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Verify Your Email - Frontier Education Fund",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4a6da7; text-align: center;">Email Verification</h2>
          <p>Hello ${user.name},</p>
          <p>Thank you for registering with Frontier Education Fund. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #4a6da7; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
          </div>
          <p>This link will expire in 24 hours. If you did not create an account, please ignore this email.</p>
          <p>Thank you,<br>The Frontier Education Fund Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // List of test emails to auto-verify
    const TEST_EMAILS = [
      "hinata@gmail.com",
      "ashito@gmail.com",
      "isagi11@gmail.com",
      "naruto@gmail.com",
      "fefadmin@gmail.com",
    ];

    // Auto-verify test emails without checking token
    if (TEST_EMAILS.includes(user.email)) {
      if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
      }
      return res.status(200).json({
        message: "Test email automatically verified",
        isTestAccount: true,
      });
    }

    // Normal verification flow for real users
    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    user.isVerified = true;
    await user.save();

    return res.status(200).json({ message: "Email successfully verified" });
  } catch (error) {
    console.error(error);
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Verification link has expired" });
    }
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};

// Register User
const registerUser = async (req, res) => {
  const { name, email, contactNumber, password, role } = req.body;

  // Validate role
  const validRoles = ["admin", "donor", "school"];
  if (!validRoles.includes(role.toLowerCase())) {
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

  // Validate phone number format
  const phoneRegex = /^\+\d{12}$/; // Example: +254712345678 (12 digits total)
  if (!phoneRegex.test(contactNumber)) {
    return res.status(400).json({
      message:
        "Please provide a valid phone number starting with a country code and exactly 12 digits (e.g., +254712345678).",
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
    if (role.toLowerCase() === "donor") {
      user = new Donor({
        name,
        email,
        contactNumber,
        password: hashedPassword,
        isVerified: false,
      });
    } else if (role.toLowerCase() === "school") {
      user = new School({
        name,
        email,
        contactNumber,
        password: hashedPassword,
        isVerified: false,
      });
    } else {
      user = new User({
        name,
        email,
        contactNumber,
        password: hashedPassword,
        role: role.toLowerCase(),
        isVerified: false,
      });
    }

    await user.save();

    await sendVerificationEmail(user);

    // Send success response
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      message:
        "Registration successful! Please check your email to verify your account.",
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

  const TEST_EMAILS = [
    "hinata@gmail.com",
    "isagi11@gmail.com",
    "naruto@gmail.com",
    "ashito@gmail.com",
    "fefadmin@gmail.com",
  ];

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Please check your email." });
    }

    if (!TEST_EMAILS.includes(email) && !user.isVerified) {
      return res.status(403).json({
        message:
          "Email not verified. Please check your email for verification instructions.",
        userId: user._id,
      });
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
        contactNumber: user.contactNumber,
        role: user.role.toLowerCase(),
      },
    });
  } catch (error) {
    console.error("Login error:", error.stack);
    res.status(500).json({
      message: error.message || "Login failed. Please try again.",
    });
  }
};

const resendVerificationEmail = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    await sendVerificationEmail(user);

    res.status(200).json({ message: "Verification email resent successfully" });
  } catch (error) {
    console.error("Error resending verification email:", error);
    res.status(500).json({ message: "Failed to resend verification email" });
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
      contactNumber: user.contactNumber,
      role: user.role,
      createdAt: user.createdAt,
      isProfileComplete: user.isProfileComplete,
      donorDetails: {},
      schoolDetails: {},
    };

    // Add discriminator-specific fields based on the user's role
    if (user.role.toLowerCase() === "donor") {
      userProfile.donorDetails = {
        donorType: user.donorType || "",
        organizationName: user.organizationName || "",
        registrationNumber: user.registrationNumber || "",
        taxExemptStatus: user.taxExemptStatus || "",
        occupation: user.occupation || "",
        donationCategories: user.donationCategories || [],
        annualBudget: user.annualBudget || "",
        donationFrequency: user.donationFrequency || "",
        organizationAffiliation: user.organizationAffiliation || "",
      };
    } else if (user.role.toLowerCase() === "school") {
      userProfile.schoolDetails = {
        schoolName: user.schoolName || "",
        location: user.location || "",
        needs: user.needs || [],
        principalName: user.principalName || "",
        schoolType: user.schoolType || "",
        numStudents: user.numStudents || "",
        accreditation: user.accreditation || "",
        website: user.website || "",
        missionStatement: user.missionStatement || "",
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

    // Update common fields
    user.name = updatedData.name || user.name;
    user.email = updatedData.email || user.email;
    user.contactNumber = updatedData.contactNumber || user.contactNumber;

    if (user.role.toLowerCase() === "school" && updatedData.schoolDetails) {
      // Update school-specific fields
      user.schoolName = updatedData.schoolDetails.schoolName || user.schoolName;
      user.location = updatedData.schoolDetails.location || user.location;
      user.needs = updatedData.schoolDetails.needs || user.needs;
      user.principalName =
        updatedData.schoolDetails.principalName || user.principalName;

      if (
        ["public", "private"].includes(
          updatedData.schoolDetails.schoolType?.toLowerCase()
        )
      ) {
        user.schoolType = updatedData.schoolDetails.schoolType.toLowerCase();
      }

      user.numStudents =
        updatedData.schoolDetails.numStudents || user.numStudents;

      user.accreditation =
        typeof updatedData.schoolDetails.accreditation === "string"
          ? updatedData.schoolDetails.accreditation === "true"
          : Boolean(updatedData.schoolDetails.accreditation);

      user.website = updatedData.schoolDetails.website || user.website;
      user.missionStatement =
        updatedData.schoolDetails.missionStatement || user.missionStatement;
    } else if (
      user.role.toLowerCase() === "donor" &&
      updatedData.donorDetails
    ) {
      // Update donor-specific fields
      user.donorType = updatedData.donorDetails.donorType || user.donorType;
      user.organizationName =
        updatedData.donorDetails.organizationName || user.organizationName;
      user.registrationNumber =
        updatedData.donorDetails.registrationNumber || user.registrationNumber;

      if (updatedData.donorDetails.taxExemptStatus !== undefined) {
        user.taxExemptStatus = Boolean(
          updatedData.donorDetails.taxExemptStatus
        );
      }

      user.occupation = updatedData.donorDetails.occupation || user.occupation;
      user.donationCategories =
        updatedData.donorDetails.donationCategories || user.donationCategories;
      user.annualBudget =
        updatedData.donorDetails.annualBudget || user.annualBudget;
      user.donationFrequency =
        updatedData.donorDetails.donationFrequency || user.donationFrequency;
      user.organizationAffiliation =
        updatedData.donorDetails.organizationAffiliation ||
        user.organizationAffiliation;
    }

    // 🔍 Check profile completeness
    const isProfileComplete = checkProfileCompleteness(user);

    console.log("Profile completeness before saving:", isProfileComplete);
    if (!isProfileComplete) {
      const missingFields = getMissingFields(user);
      console.log("Missing fields preventing completion:", missingFields);
    }

    user.isProfileComplete = isProfileComplete;
    user.profileCompleted = isProfileComplete; // Ensure both fields are updated

    await user.save();

    console.log("Updated user after saving:", user);

    // Return the full user object, including discriminator-specific fields
    const fullUser = await User.findById(userId).lean(); // Use .lean() to get a plain JavaScript object
    return res
      .status(200)
      .json({ message: "Profile updated successfully", user: fullUser });
  } catch (err) {
    console.error("Error updating profile:", err);
    return res.status(500).json({ message: "Server error: " + err.message });
  }
};

// Function to check profile completeness
const checkProfileCompleteness = (user) => {
  let requiredFields = [];

  if (user.role === "school") {
    requiredFields = [
      "schoolName",
      "location",
      "principalName",
      "schoolType",
      "numStudents",
      "accreditation",
      "website",
      "missionStatement",
    ];
  } else if (user.role === "donor") {
    requiredFields = [
      "donorType",
      "organizationName",
      "registrationNumber",
      "taxExemptStatus",
      "occupation",
      "donationCategories",
      "annualBudget",
      "donationFrequency",
      "organizationAffiliation",
    ];

    if (user.donorType === "Individual") {
      requiredFields = requiredFields.filter(
        (field) => field !== "organizationAffiliation"
      );
    }
  }

  return requiredFields.every((field) => user[field] && user[field] !== "");
};

// Function to log missing fields
const getMissingFields = (user) => {
  let requiredFields =
    user.role === "school"
      ? [
          "schoolName",
          "location",
          "principalName",
          "schoolType",
          "numStudents",
          "accreditation",
          "website",
          "missionStatement",
        ]
      : [
          "donorType",
          "organizationName",
          "registrationNumber",
          "taxExemptStatus",
          "occupation",
          "donationCategories",
          "annualBudget",
          "donationFrequency",
          "organizationAffiliation",
        ];

  if (user.role === "donor" && user.donorType === "Individual") {
    requiredFields = requiredFields.filter(
      (field) => field !== "organizationAffiliation"
    );
  }

  return requiredFields.filter((field) => !user[field] || user[field] === "");
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  verifyEmail,
  resendVerificationEmail,
};
