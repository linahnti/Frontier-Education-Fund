const Ticket = require("../models/tickets");
const User = require("../models/user");

const createTicket = async (req, res) => {
  try {
    const { subject, message, urgency } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`;

    const ticket = new Ticket({
      ticketNumber,
      userEmail: user.email,
      userId,
      subject,
      message,
      urgency,
      status: "open",
    });

    await ticket.save();

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
