// routes/testRoutes.js
const express = require('express');
const router = express.Router();
const { sendTicketConfirmation, notifySupportTeam } = require('../utils/emailService');

router.get('/test-email', async (req, res) => {
  const testData = {
    user: {
      name: "Test User",
      email: "recipient@example.com",
    },
    ticket: {
      ticketNumber: "TKT-TEST123",
      subject: "Test Ticket",
      message: "This is a test message",
      urgency: "medium",
      userType: "Donor"
    }
  };

  try {
    await Promise.all([
      sendTicketConfirmation(testData.user, testData.ticket),
      notifySupportTeam(testData.user, testData.ticket)
    ]);
    res.send("Test emails sent successfully!");
  } catch (error) {
    res.status(500).send(`Email test failed: ${error.message}`);
  }
});

module.exports = router;