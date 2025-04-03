import React, { useState, useEffect } from "react";
import {
  Card,
  Accordion,
  Button,
  Modal,
  Form,
  Alert,
  Tab,
  Tabs,
} from "react-bootstrap";
import { useTheme } from "../contexts/ThemeContext";
import { useProfile } from "../contexts/ProfileContext";
import emailjs from "@emailjs/browser";
import "../styles/SchoolSupport.css";

const DonorSupport = () => {
  const { darkMode } = useTheme();
  const { currentUser } = useProfile();
  const [showModal, setShowModal] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("faqs");
  const [ticketData, setTicketData] = useState({
    userEmail: currentUser?.email || "",
    subject: "",
    message: "",
    urgency: "medium",
  });

  // Update email when currentUser changes
  useEffect(() => {
    if (currentUser?.email) {
      setTicketData((prev) => ({ ...prev, userEmail: currentUser.email }));
    }
  }, [currentUser]);

  // Generate ticket number when modal opens
  useEffect(() => {
    if (showModal) {
      setTicketNumber(`TKT-${Date.now().toString().slice(-6)}`);
    }
  }, [showModal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTicketData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Save to MongoDB
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          subject: ticketData.subject,
          message: ticketData.message,
          urgency: ticketData.urgency,
          userType: "donor",
        }),
      });

      if (!response.ok) throw new Error("Failed to save ticket");

      // 2. Send emails via EmailJS
      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        {
          ...ticketData,
          ticketNumber,
          to_email: "donor-support@yourschool.edu",
        },
        process.env.REACT_APP_EMAILJS_USER_ID
      );

      setShowSuccess(true);
    } catch (error) {
      console.error("Error submitting ticket:", error);
      alert("Failed to submit ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTicketData({
      userEmail: currentUser?.email || "",
      subject: "",
      message: "",
      urgency: "medium",
    });
    setShowSuccess(false);
  };

  // Donor-specific FAQ data
  const donorFaqs = [
    {
      question: "How do I make a donation?",
      answer:
        "Navigate to the 'Explore Schools' tab, select a school, and click 'Donate Now' to choose items to donate.",
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "We accept M-Pesa, credit/debit cards, and bank transfers. All payments are processed securely.",
    },
    {
      question: "Can I get a donation receipt for tax purposes?",
      answer:
        "Yes, all donations over KES 1,000 automatically receive a tax-deductible receipt via email within 7 business days.",
    },
    {
      question: "How do I track my donation history?",
      answer:
        "Your complete donation history is available in the 'Donations' tab of your dashboard, updated in real-time.",
    },
    {
      question: "What happens if a school no longer needs my pledged donation?",
      answer:
        "You'll be notified immediately and can choose to redirect your donation to another school or request a refund.",
    },
  ];

  const contactInfo = [
    {
      method: "Donor Support Email",
      details: "donor-support@yourschool.edu",
      icon: "bi-envelope-fill",
      iconClass: "text-primary",
      action: "mailto:donor-support@yourschool.edu",
      bgClass: darkMode ? "bg-dark" : "bg-light-primary",
    },
    {
      method: "Donor Helpline",
      details: "+254 700 123 456",
      icon: "bi-telephone-fill",
      iconClass: "text-info",
      action: "tel:+254700123456",
      bgClass: darkMode ? "bg-dark" : "bg-light-info",
    },
    {
      method: "WhatsApp Support",
      details: "Available 24/7 for urgent queries",
      icon: "bi-whatsapp",
      iconClass: "text-success",
      action:
        "https://wa.me/254700123456?text=Hello%20Donor%20Support,%20I%20need%20help%20with...",
      bgClass: darkMode ? "bg-dark" : "bg-light-success",
    },
  ];

  return (
    <div className="support-tab">
      <h3 className={`mb-4 ${darkMode ? "text-light" : "text-dark"}`}>
        <i className="bi bi-question-circle me-2"></i>
        Donor Support Center
      </h3>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Tab eventKey="faqs" title="FAQs">
          {/* FAQs Section */}
          <Card className={`mb-4 ${darkMode ? "bg-dark text-light" : ""}`}>
            <Card.Header
              className={darkMode ? "bg-secondary text-light" : "bg-light"}
            >
              <h4>
                <i className="bi bi-patch-question me-2"></i>
                Frequently Asked Questions
              </h4>
            </Card.Header>
            <Card.Body>
              <Accordion flush>
                {donorFaqs.map((faq, index) => (
                  <Accordion.Item
                    key={index}
                    eventKey={index.toString()}
                    className={darkMode ? "bg-dark text-light" : ""}
                  >
                    <Accordion.Header>{faq.question}</Accordion.Header>
                    <Accordion.Body>{faq.answer}</Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="contact" title="Contact Support">
          {/* Contact Information */}
          <Card className={`mb-4 ${darkMode ? "bg-dark text-light" : ""}`}>
            <Card.Header
              className={darkMode ? "bg-secondary text-light" : "bg-light"}
            >
              <h4>
                <i className="bi bi-headset me-2"></i>
                Contact Donor Support
              </h4>
            </Card.Header>
            <Card.Body>
              <div className="row g-4">
                {contactInfo.map((contact, index) => (
                  <div key={index} className="col-md-4">
                    <a
                      href={contact.action}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-decoration-none"
                    >
                      <div
                        className={`contact-card p-4 rounded-3 h-100 ${
                          contact.bgClass
                        } ${darkMode ? "border border-secondary" : ""}`}
                      >
                        <div className="icon-wrapper mb-3">
                          <i
                            className={`${contact.icon} display-5 ${contact.iconClass}`}
                          ></i>
                        </div>
                        <h5
                          className={`mb-2 ${
                            darkMode ? "text-light" : "text-dark"
                          }`}
                        >
                          {contact.method}
                        </h5>
                        <p
                          className={`mb-0 ${
                            darkMode ? "text-light" : "text-muted"
                          }`}
                        >
                          {contact.details}
                        </p>
                        <div className="mt-3">
                          <span className={`action-link ${contact.iconClass}`}>
                            Contact us{" "}
                            <i className="bi bi-arrow-right-short"></i>
                          </span>
                        </div>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      <div className="mt-4">
        <Button
          variant={darkMode ? "outline-light" : "primary"}
          onClick={() => setShowModal(true)}
          disabled={!currentUser}
        >
          <i className="bi bi-ticket-detailed me-2"></i>
          Open Support Ticket
          {!currentUser && <span className="ms-2">(Login Required)</span>}
        </Button>
      </div>

      {/* Support Ticket Modal */}
      <Modal
        show={showModal}
        onHide={() => !isSubmitting && setShowModal(false)}
        centered
      >
        <Modal.Header
          closeButton={!isSubmitting}
          className={darkMode ? "bg-dark text-light" : ""}
        >
          <Modal.Title>
            <i className="bi bi-ticket-detailed me-2"></i>
            Create Support Ticket
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode ? "bg-dark" : "bg-white"}>
          {showSuccess ? (
            <Alert variant="success" className="text-center">
              <i className="bi bi-check-circle-fill fs-1 text-success"></i>
              <h4>Ticket Submitted!</h4>
              <p>Your ticket #{ticketNumber} has been received.</p>
              <p>We've sent a confirmation to {ticketData.userEmail}</p>
              <Button
                variant="success"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="mt-3"
              >
                Close
              </Button>
            </Alert>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Your Email</Form.Label>
                <Form.Control
                  type="email"
                  name="userEmail"
                  value={ticketData.userEmail}
                  onChange={handleInputChange}
                  required
                  readOnly
                  className="bg-light"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Subject</Form.Label>
                <Form.Control
                  type="text"
                  name="subject"
                  value={ticketData.subject}
                  onChange={handleInputChange}
                  required
                  className="bg-white border border-secondary"
                  placeholder="Briefly describe your issue"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Message</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="message"
                  value={ticketData.message}
                  onChange={handleInputChange}
                  required
                  className="bg-white border border-secondary"
                  placeholder="Please provide detailed information about your issue"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Urgency Level</Form.Label>
                <Form.Select
                  name="urgency"
                  value={ticketData.urgency}
                  onChange={handleInputChange}
                  className="bg-white border border-secondary"
                >
                  <option value="low">Low (General inquiry)</option>
                  <option value="medium">
                    Medium (Important but not urgent)
                  </option>
                  <option value="high">High (Affecting donations)</option>
                  <option value="critical">Critical (Payment issue)</option>
                </Form.Select>
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="me-2"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Submitting...
                    </>
                  ) : (
                    "Submit Ticket"
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DonorSupport;
