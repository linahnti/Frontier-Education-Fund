const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const cors = require("cors");

dotenv.config(); // Load environment variables from .env file
connectDB(); // Connect to MongoDB

const app = express(); // Initialize the Express app
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies & authentication headers
  })
);
app.use(express.json()); // Middleware to parse incoming JSON data

// Import Routes
const userRoutes = require("./routes/userRoutes.js"); // Existing user routes
const donationRequestRoutes = require("./routes/donationRequestRoutes.js"); // Donation request routes
const schoolRoutes = require("./routes/schoolRoutes.js"); // School-specific routes
const donorRoutes = require("./routes/donorRoutes.js"); // Donor-specific routes

// Use Routes
app.use("/api/users", userRoutes); // All user-related APIs will start with /api/users
app.use("/api/donation-requests", donationRequestRoutes); // Donation request APIs
app.use("/api/schools", schoolRoutes); // School-specific APIs
app.use("/api/donors", donorRoutes); // Donor-specific APIs

const PORT = process.env.PORT || 5000; // Define the server's port
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // Start the server
