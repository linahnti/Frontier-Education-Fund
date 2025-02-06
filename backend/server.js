const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const cors = require("cors");

dotenv.config(); // Load environment variables from .env file
connectDB(); // Connect to MongoDB

const app = express(); // Initialize the Express app
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse incoming JSON data

const userRoutes = require("./routes/userRoutes.js");
app.use("/api/users", userRoutes); // All user-related APIs will start with /api/users

const forgotPasswordRoutes = require("./routes/forgotPasswordRoutes.js");
app.use("/api/forgot-password", forgotPasswordRoutes);

const PORT = process.env.PORT || 5000; // Define the server's port
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // Start the server
