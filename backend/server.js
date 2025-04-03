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
const userRoutes = require("./routes/userRoutes.js");
const donationRequestRoutes = require("./routes/donationRequestRoutes.js");
const schoolRoutes = require("./routes/schoolRoutes.js");
const donorRoutes = require("./routes/donorRoutes.js");
const donationRoutes = require("./routes/donationRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const ticketRoutes = require("./routes/ticketRoutes.js");

// User Routes
app.use("/api/users", userRoutes);
app.use("/api/donation-requests", donationRequestRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tickets", ticketRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
