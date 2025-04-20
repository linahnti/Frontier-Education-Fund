const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const cors = require("cors");

dotenv.config();
connectDB(); 

const app = express(); 
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json()); 

// Import Routes
const userRoutes = require("./routes/userRoutes.js");
const donationRequestRoutes = require("./routes/donationRequestRoutes.js");
const schoolRoutes = require("./routes/schoolRoutes.js");
const donorRoutes = require("./routes/donorRoutes.js");
const donationRoutes = require("./routes/donationRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const adminReportRoutes = require("./routes/adminReportRoutes.js");
const ticketRoutes = require("./routes/ticketRoutes.js");
const forgotPasswordRoutes = require("./routes/forgotPasswordRoutes.js");
const messageRoutes = require("./routes/messageRoutes.js");
const paystackRoutes = require("./routes/paystackRoutes.js");

// User Routes
app.use("/api/users", userRoutes);
app.use("/api/donation-requests", donationRequestRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/reports", adminReportRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/forgot-password", forgotPasswordRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/paystack", paystackRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
