const express = require("express");
const {
  createTicket,
  getUserTickets,
} = require("../controllers/ticketController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", protect, createTicket);
router.get("/", protect, getUserTickets);

module.exports = router;
