require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./user.js");

const dbURI = process.env.MONGO_URI;

console.log("Mongo URI:", dbURI);

const createAdmin = async () => {
  const adminEmail = "fefadmin@gmail.com";
  const adminPassword = "OnlyTheAdmin@2025";

  // Check if the admin user already exists
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    console.log("Admin account already exists.");
    return;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Create the admin user
  const adminUser = new User({
    name: "Admin",
    email: adminEmail,
    password: hashedPassword,
    role: "Admin", 
    
  });

  try {
    await adminUser.save();
    console.log("Admin account created successfully!");
  } catch (error) {
    console.error("Error creating admin account:", error.message);
  }
};

if (!dbURI) {
  console.log("Mongo URI is undefined. Please check your .env file.");
  process.exit(1); 
}

// Connect to MongoDB and create the admin account
mongoose
  .connect(dbURI) 
  .then(() => {
    console.log("Connected to MongoDB");
    createAdmin(); 
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });
