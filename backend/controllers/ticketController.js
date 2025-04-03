const Ticket = require("../models/tickets");
const User = require("../models/user");
const {
  sendTicketConfirmation,
  notifySupportTeam,
} = require("../utils/emailService");

const createTicket = async (req, res) => {
  try {
    const { subject, message, urgency, userType } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isProfileComplete) {
      return res.status(400).json({
        message:
          "Please complete your profile before submitting support tickets",
      });
    }

    const ticketNumber = `TKT-${Date.now().toString().slice(-6)}-${Math.floor(
      Math.random() * 1000
    )
      .toString()
      .padStart(3, "0")}`;

    const ticket = new Ticket({
      ticketNumber,
      userEmail: user.email,
      userId,
      subject,
      message,
      urgency,
      userType: userType || user.role || "School",
      status: "open",
    });

    await ticket.save();

    await Promise.all([
      sendTicketConfirmation(user, ticket),
      notifySupportTeam(user, ticket),
    ]).catch((error) => {
      console.error("Email sending failed:", error);
    });

    res.status(201).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

const getUserTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTicket,
  getUserTickets,
};
