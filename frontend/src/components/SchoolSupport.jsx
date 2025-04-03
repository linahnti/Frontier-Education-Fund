import React, { useState, useEffect } from "react";
import { Card, Accordion, Button, Modal, Form, Alert } from "react-bootstrap";
import { useTheme } from "../contexts/ThemeContext";
import { useProfile } from "../contexts/ProfileContext";
import "../styles/SchoolSupport.css";
import ProfileCompletionModal from "./ProfileCompletionModal";
import ErrorModal from "./ErrorModal";

const SchoolSupport = () => {
  const { darkMode } = useTheme();
  const { currentUser, isProfileComplete } = useProfile();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTicketData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Save to MongoDB
      const response = await fetch("http://localhost:5000/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          subject: ticketData.subject,
          message: ticketData.message,
          urgency: ticketData.urgency,
          userType: "School",
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.message?.includes("profile")) {
          setShowProfileModal(true);
          setShowModal(false);
          throw new Error(responseData.message);
        }
        throw new Error(responseData.message || "Failed to save ticket");
      }

      setShowSuccess(true);
    } catch (error) {
      console.error("Error submitting ticket:", error);
      if (!error.message.includes("profile")) {
        setErrorMessage(
          error.message || "Failed to submit ticket. Please try again."
        );
        setShowErrorModal(true);
      }
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

  // FAQ data
  const faqs = [
    {
      question: "How do I create a donation request?",
      answer: "Navigate to the Donations tab and click 'Ask for Support'...",
    },
    {
      question: "What types of donations can I request?",
      answer:
        "You can request learning materials (books, stationery), infrastructure (classrooms, toilets), financial aid (school fees support), utilities (electricity, internet), health supplies, and food programs.",
    },
    {
      question: "How long does it take for requests to be fulfilled?",
      answer:
        "Response times vary depending on donor availability. Typically, requests receive responses within 1-2 weeks. Make sure your profile is complete to increase visibility.",
    },
    {
      question: "How do I track my donation requests?",
      answer:
        "All your requests and their statuses can be viewed in the Donations tab. You'll also receive notifications when donors respond to your requests.",
    },
    {
      question: "What should I do if I need to cancel a request?",
      answer:
        "Currently, requests cannot be canceled once submitted. Please contact support if you need to modify or withdraw a request.",
    },
  ];

  const contactInfo = [
    {
      method: "Email Support",
      details: "support@yourschool.edu",
      icon: "bi-envelope-fill",
      iconClass: "text-primary",
      action: "mailto:support@yourschool.edu",
      bgClass: darkMode ? "bg-dark" : "bg-light-primary",
    },
    {
      method: "Phone Support",
      details: "+254 703 530 804",
      icon: "bi-telephone-fill",
      iconClass: "text-info",
      action: "tel:+254703530804",
      bgClass: darkMode ? "bg-dark" : "bg-light-info",
    },
    {
      method: "WhatsApp Chat",
      details: "Available Monday-Friday, 9AM-4PM",
      icon: "bi-whatsapp",
      iconClass: "text-success",
      action:
        "https://wa.me/254703530804?text=Hello%20Support,%20I%20need%20help%20with...",
      bgClass: darkMode ? "bg-dark" : "bg-light-success",
    },
  ];

  return (
    <div className="support-tab">
      <h3 className={`mb-4 ${darkMode ? "text-light" : "text-dark"}`}>
        <i className="bi bi-question-circle me-2"></i>
        Support Center
      </h3>

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
            {faqs.map((faq, index) => (
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

      {/* Contact Information */}
      <Card className={`mb-4 ${darkMode ? "bg-dark text-light" : ""}`}>
        <Card.Header
          className={darkMode ? "bg-secondary text-light" : "bg-light"}
        >
          <h4>
            <i className="bi bi-headset me-2"></i>
            Contact Support
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
                        Contact us <i className="bi bi-arrow-right-short"></i>
                      </span>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Button
              variant={darkMode ? "outline-light" : "primary"}
              onClick={() => {
                if (!currentUser) return;
                if (!isProfileComplete) {
                  setShowProfileModal(true);
                } else {
                  setShowModal(true);
                }
              }}
              disabled={!currentUser}
            >
              <i className="bi bi-ticket-detailed me-2"></i>
              Open Support Ticket
              {!currentUser && <span className="ms-2">(Login Required)</span>}
            </Button>

            <ProfileCompletionModal
              show={showProfileModal}
              onHide={() => setShowProfileModal(false)}
            />
          </div>
        </Card.Body>
      </Card>

      <ErrorModal
        show={showErrorModal}
        onHide={() => setShowErrorModal(false)}
        message={errorMessage}
      />

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
              <p>Your ticket has been received.</p>
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
                  <option value="high">High (Affecting operations)</option>
                  <option value="critical">Critical (System down)</option>
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

export default SchoolSupport;
