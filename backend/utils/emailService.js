const nodemailer = require("nodemailer");
const path = require("path");
const ejs = require("ejs");

console.log("Environment Variables:", {
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_APP_PASSWORD: process.env.EMAIL_APP_PASSWORD ? "*****" : "MISSING",
  DONOR_SUPPORT_EMAIL: process.env.DONOR_SUPPORT_EMAIL,
  SCHOOL_SUPPORT_EMAIL: process.env.SCHOOL_SUPPORT_EMAIL,
});

if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
  console.error("Current Environment Variables:", process.env);
  throw new Error(`
      Email credentials missing! Verify:
      1. .env file exists in backend root
      2. Contains EMAIL_USER and EMAIL_APP_PASSWORD
      3. server.js loads dotenv FIRST
      4. No typos in variable names
    `);
}

// Configure transporter with error handling
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false  // Only for testing, remove in production
    }
  });

// Verify transporter connection
transporter.verify((error) => {
  if (error) {
    console.error("Error with mail transporter:", error);
  } else {
    console.log("Mail transporter is ready");
  }
});

/**
 * Send ticket confirmation to user with robust error handling
 */
const sendTicketConfirmation = async (user, ticket) => {
  try {
    if (!user?.email || !ticket?.ticketNumber) {
      throw new Error("Missing required user or ticket data");
    }

    // Safely render HTML template
    const html = await ejs.renderFile(
      path.join(__dirname, "../templates/email-ticket.ejs"),
      {
        user: user || {},
        ticket: ticket || {},
      }
    );

    const mailOptions = {
      from: `"School Support Team" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Ticket #${ticket.ticketNumber} Confirmation`,
      html: html || generateFallbackContent(user, ticket),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${user.email}`);
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    throw error; // Re-throw to handle in calling function
  }
};

/**
 * Notify support team with validation
 */
const notifySupportTeam = async (user, ticket) => {
  try {
    if (!ticket?.userType) {
      throw new Error("Ticket userType is required");
    }

    const supportEmail = getSupportEmail(ticket.userType);
    if (!supportEmail) {
      throw new Error("No support email configured for this user type");
    }

    const mailOptions = {
      from: `"Support System" <${process.env.EMAIL_USER}>`,
      to: supportEmail,
      subject: `New ${ticket.userType} Ticket: ${ticket.ticketNumber}`,
      html: generateSupportNotificationHtml(user, ticket),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Notification sent to support team: ${supportEmail}`);
  } catch (error) {
    console.error("Failed to notify support team:", error);
    throw error;
  }
};

// Helper functions
function generateFallbackContent(user, ticket) {
  return `
    <h2>Hello ${user?.name || "User"},</h2>
    <p>Your support ticket has been received!</p>
    <p><strong>Ticket #:</strong> ${ticket?.ticketNumber || "N/A"}</p>
    <p><strong>Subject:</strong> ${ticket?.subject || "No subject"}</p>
    <p><strong>Urgency:</strong> ${ticket?.urgency || "medium"}</p>
    <p>We'll respond within 24-48 hours.</p>
  `;
}

function generateSupportNotificationHtml(user, ticket) {
  return `
    <h3>New Ticket Submitted</h3>
    <p><strong>From:</strong> ${user?.name || "Unknown"} (${
    user?.email || "No email"
  })</p>
    <p><strong>Ticket #:</strong> ${ticket?.ticketNumber || "N/A"}</p>
    <p><strong>Urgency:</strong> ${ticket?.urgency || "medium"}</p>
    <hr>
    <p>${ticket?.message?.replace(/\n/g, "<br>") || "No message provided"}</p>
  `;
}

function getSupportEmail(userType) {
  return userType === "Donor"
    ? process.env.DONOR_SUPPORT_EMAIL
    : process.env.SCHOOL_SUPPORT_EMAIL;
}

module.exports = {
  sendTicketConfirmation,
  notifySupportTeam,
  transporter, // Export for testing
};
