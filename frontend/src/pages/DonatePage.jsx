import React, { useState, useEffect } from "react";
import {
  Form,
  Row,
  Col,
  Button,
  Alert,
  Container,
  Card,
  ProgressBar,
  Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import assets from "../assets/images/assets";
import { API_URL } from "../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHandHoldingUsd,
  faBoxOpen,
  faSchool,
  faMoneyBillWave,
  faCalendarAlt,
  faMobile,
  faArrowLeft,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "../contexts/ThemeContext";

const DonatePage = () => {
  const [donationType, setDonationType] = useState("money");
  const [amount, setAmount] = useState("");
  const [items, setItems] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [schools, setSchools] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Fetch schools on component mount
  useEffect(() => {
    const fetchSchools = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/schools`);
        setSchools(response.data);
      } catch (error) {
        console.error("Error fetching schools:", error);
        setError("Unable to load schools. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchools();
  }, []);

  const validateStep = () => {
    if (step === 1) {
      if (!schoolId) {
        setError("Please select a school to continue.");
        return false;
      }
      setError(null);
      return true;
    }

    if (step === 2) {
      if (donationType === "money" && (isNaN(amount) || amount <= 0)) {
        setError(
          "Please enter a valid donation amount (must be greater than zero)."
        );
        return false;
      }

      if (donationType === "items") {
        if (!items || items.trim() === "") {
          setError("Items cannot be empty for item donations.");
          return false;
        }
        if (!preferredDate || isNaN(new Date(preferredDate).getTime())) {
          setError("Invalid preferred delivery date.");
          return false;
        }
      }
      setError(null);
      return true;
    }

    if (step === 3) {
      if (
        donationType === "money" &&
        (!phoneNumber || phoneNumber.trim() === "")
      ) {
        setError("Phone number is required for M-Pesa payment.");
        return false;
      }
      setError(null);
      return true;
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const donorId = JSON.parse(localStorage.getItem("user")).id;

      const response = await axios.post(
        `${API_URL}/api/donations`,
        {
          donorId,
          schoolId,
          type: donationType,
          amount: donationType === "money" ? amount : null,
          items:
            donationType === "items"
              ? items.split(",").map((item) => item.trim())
              : null,
          preferredDate:
            donationType === "items" ? new Date(preferredDate) : null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        setSuccess("Donation submitted successfully!");
        setTimeout(() => navigate("/donor-dashboard"), 2000);
      }
    } catch (error) {
      console.error("Error submitting donation:", error);
      setError("Failed to submit donation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle M-Pesa STK Push
  const handleMpesaPayment = async () => {
    if (!validateStep()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/api/mpesa/stkpush`,
        {
          phoneNumber,
          amount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setSuccess(
          "M-Pesa STK push initiated. Check your phone to complete the payment."
        );
        setTimeout(() => handleSubmit({ preventDefault: () => {} }), 100);
      }
    } catch (error) {
      console.error("Error initiating M-Pesa payment:", error);
      setError("Failed to initiate M-Pesa payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedSchool = () => {
    return schools.find((school) => school._id === schoolId) || {};
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h4 className="text-center mb-4">Select a School to Support</h4>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">
                <FontAwesomeIcon icon={faSchool} className="me-2" />
                Choose a School
              </Form.Label>
              <Form.Select
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                className="form-control-lg"
                disabled={isLoading}
              >
                <option value="">Select a school to support</option>
                {schools.map((school) => (
                  <option key={school._id} value={school._id}>
                    {school.schoolName}
                  </option>
                ))}
              </Form.Select>
              <div className="text-muted mt-2 small">
                <FontAwesomeIcon icon={faQuestionCircle} className="me-1" />
                Your donation will directly benefit this school and its students
              </div>
            </Form.Group>
            <div className="d-grid mt-4">
              <Button
                variant="primary"
                size="lg"
                onClick={nextStep}
                disabled={isLoading || !schoolId}
              >
                Next: Choose Donation Type
              </Button>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h4 className="text-center mb-4">
              <Badge bg="success" className="me-2">
                School Selected:
              </Badge>
              {getSelectedSchool().schoolName}
            </h4>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Donation Type</Form.Label>
              <Row>
                <Col xs={6}>
                  <Card
                    className={`h-100 ${
                      donationType === "money" ? "border-primary" : ""
                    }`}
                    style={{
                      cursor: "pointer",
                      backgroundColor:
                        donationType === "money"
                          ? darkMode
                            ? "#1e3a8a"
                            : "#e6f7ff"
                          : "",
                      borderWidth: donationType === "money" ? "2px" : "1px",
                    }}
                    onClick={() => setDonationType("money")}
                  >
                    <Card.Body className="text-center py-4">
                      <FontAwesomeIcon
                        icon={faMoneyBillWave}
                        size="3x"
                        className="mb-3"
                        style={{
                          color:
                            donationType === "money" ? "#2563eb" : "#6c757d",
                        }}
                      />
                      <h5>Money Donation</h5>
                      <p className="small mb-0">
                        Support with financial contribution
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={6}>
                  <Card
                    className={`h-100 ${
                      donationType === "items" ? "border-primary" : ""
                    }`}
                    style={{
                      cursor: "pointer",
                      backgroundColor:
                        donationType === "items"
                          ? darkMode
                            ? "#1e3a8a"
                            : "#e6f7ff"
                          : "",
                      borderWidth: donationType === "items" ? "2px" : "1px",
                    }}
                    onClick={() => setDonationType("items")}
                  >
                    <Card.Body className="text-center py-4">
                      <FontAwesomeIcon
                        icon={faBoxOpen}
                        size="3x"
                        className="mb-3"
                        style={{
                          color:
                            donationType === "items" ? "#2563eb" : "#6c757d",
                        }}
                      />
                      <h5>Item Donation</h5>
                      <p className="small mb-0">
                        Donate books, supplies, or equipment
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Form.Group>

            {donationType === "money" && (
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" />
                  Amount (KES)
                </Form.Label>
                <Form.Control
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter donation amount"
                  className="form-control-lg"
                  required
                />
                <div className="d-flex justify-content-between mt-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setAmount("500")}
                    className="flex-grow-1 mx-1"
                  >
                    500 KES
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setAmount("1000")}
                    className="flex-grow-1 mx-1"
                  >
                    1,000 KES
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setAmount("2500")}
                    className="flex-grow-1 mx-1"
                  >
                    2,500 KES
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setAmount("5000")}
                    className="flex-grow-1 mx-1"
                  >
                    5,000 KES
                  </Button>
                </div>
              </Form.Group>
            )}

            {donationType === "items" && (
              <>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">
                    <FontAwesomeIcon icon={faBoxOpen} className="me-2" />
                    Items (comma-separated)
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={items}
                    onChange={(e) => setItems(e.target.value)}
                    placeholder="e.g., Textbooks, Stationery, Uniforms"
                    className="form-control-lg"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                    Preferred Delivery Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="form-control-lg"
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </Form.Group>
              </>
            )}

            <Row className="mt-4">
              <Col xs={6}>
                <Button
                  variant="outline-secondary"
                  size="lg"
                  className="w-100"
                  onClick={prevStep}
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                  Back
                </Button>
              </Col>
              <Col xs={6}>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-100"
                  onClick={nextStep}
                  disabled={isLoading}
                >
                  Next: Review & Submit
                </Button>
              </Col>
            </Row>
          </>
        );
      case 3:
        return (
          <>
            <h4 className="text-center mb-4">Review & Submit Your Donation</h4>

            <Card className="mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">Donation Summary</h5>
              </Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col xs={4} className="text-muted">
                    School:
                  </Col>
                  <Col xs={8} className="fw-bold">
                    {getSelectedSchool().schoolName}
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col xs={4} className="text-muted">
                    Donation Type:
                  </Col>
                  <Col xs={8} className="fw-bold">
                    {donationType === "money" ? (
                      <span>
                        <FontAwesomeIcon
                          icon={faMoneyBillWave}
                          className="me-2"
                        />
                        Money
                      </span>
                    ) : (
                      <span>
                        <FontAwesomeIcon icon={faBoxOpen} className="me-2" />
                        Items
                      </span>
                    )}
                  </Col>
                </Row>

                {donationType === "money" && (
                  <Row className="mb-3">
                    <Col xs={4} className="text-muted">
                      Amount:
                    </Col>
                    <Col xs={8} className="fw-bold">
                      {amount} KES
                    </Col>
                  </Row>
                )}

                {donationType === "items" && (
                  <>
                    <Row className="mb-3">
                      <Col xs={4} className="text-muted">
                        Items:
                      </Col>
                      <Col xs={8} className="fw-bold">
                        {items.split(",").map((item, index) => (
                          <Badge bg="info" className="me-1 mb-1" key={index}>
                            {item.trim()}
                          </Badge>
                        ))}
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col xs={4} className="text-muted">
                        Delivery Date:
                      </Col>
                      <Col xs={8} className="fw-bold">
                        {new Date(preferredDate).toLocaleDateString()}
                      </Col>
                    </Row>
                  </>
                )}
              </Card.Body>
            </Card>

            {donationType === "money" && (
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">
                  <FontAwesomeIcon icon={faMobile} className="me-2" />
                  M-Pesa Phone Number
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., 0712345678 or 0112345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="form-control-lg"
                  required
                />
                <div className="text-muted mt-2 small">
                  You'll receive an M-Pesa prompt on this phone to complete the
                  payment
                </div>
              </Form.Group>
            )}

            <Row className="mt-4">
              <Col xs={6}>
                <Button
                  variant="outline-secondary"
                  size="lg"
                  className="w-100"
                  onClick={prevStep}
                  disabled={isLoading}
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                  Back
                </Button>
              </Col>
              <Col xs={6}>
                {donationType === "money" ? (
                  <Button
                    variant="success"
                    size="lg"
                    className="w-100"
                    onClick={handleMpesaPayment}
                    disabled={isLoading}
                  >
                    <FontAwesomeIcon icon={faHandHoldingUsd} className="me-2" />
                    {isLoading ? "Processing..." : "Pay via M-Pesa"}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-100"
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? "Submitting..." : "Submit Donation"}
                  </Button>
                )}
              </Col>
            </Row>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${assets.background1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 0",
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8} xl={7}>
            <Card
              className="shadow-lg"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: "15px",
                overflow: "hidden",
              }}
            >
              {/* Header with Progress Bar */}
              <Card.Header
                className="text-center py-3"
                style={{
                  background:
                    "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
                  color: "white",
                  border: "none",
                }}
              >
                <h2 className="mb-3">
                  <FontAwesomeIcon icon={faHandHoldingUsd} className="me-2" />
                  Make a Donation
                </h2>
                <ProgressBar
                  now={(step / 3) * 100}
                  variant="warning"
                  className="mt-3"
                  style={{ height: "10px", borderRadius: "5px" }}
                />
                <div className="d-flex justify-content-between mt-1">
                  <small className={step >= 1 ? "fw-bold" : ""}>School</small>
                  <small className={step >= 2 ? "fw-bold" : ""}>Details</small>
                  <small className={step >= 3 ? "fw-bold" : ""}>Confirm</small>
                </div>
              </Card.Header>

              <Card.Body className="p-4">
                {/* Error and Success Messages */}
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                {isLoading && (
                  <Alert variant="info">Processing your request...</Alert>
                )}

                <Form onSubmit={(e) => e.preventDefault()}>{renderStep()}</Form>
              </Card.Body>

              <Card.Footer className="py-3 text-center bg-light">
                <Button
                  variant="link"
                  size="sm"
                  className="text-muted"
                  onClick={() => navigate("/donor-dashboard")}
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="me-1" />
                  Return to Dashboard
                </Button>

                <Button
                  variant="link"
                  size="sm"
                  className="text-muted ms-3"
                  onClick={() => navigate("/donor-support")}
                >
                  <FontAwesomeIcon icon={faQuestionCircle} className="me-1" />
                  Need Help?
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DonatePage;
