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
  Spinner,
} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const [paymentStatus, setPaymentStatus] = useState(null);

  // Theme colors
  const themeStyles = {
    textPrimary: darkMode ? "#f8fafc" : "#1e293b",
    textSecondary: darkMode ? "#e2e8f0" : "#334155",
    textMuted: darkMode ? "#94a3b8" : "#64748b",
    bgPrimary: darkMode ? "#1e293b" : "#ffffff",
    bgSecondary: darkMode ? "#0f172a" : "#f8fafc",
    borderColor: darkMode ? "#334155" : "#e2e8f0",
    cardBg: darkMode ? "#1e293b" : "#ffffff",
    cardSelectedBg: darkMode ? "#1e3a8a" : "#e6f7ff",
    inputBg: darkMode ? "#1e293b" : "#ffffff",
    inputBorder: darkMode ? "#334155" : "#cbd5e1",
    buttonOutline: darkMode ? "outline-light" : "outline-secondary",
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const reference = queryParams.get("reference");

    if (reference) {
      setIsLoading(true);
      setPaymentStatus("verifying");

      const verifyPayment = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `${API_URL}/api/paystack/verify?reference=${reference}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (
            response.data &&
            response.data.message === "Payment verified successfully"
          ) {
            setPaymentStatus("success");
            setSuccess(
              "Thank you for your generous donation! Your support will make a real difference."
            );
            setTimeout(() => navigate("/donor-dashboard"), 3000);
          } else {
            setPaymentStatus("error");
            setError(
              "We couldn't verify your payment. Please contact support if funds were deducted."
            );
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          setPaymentStatus("error");
          setError("Payment verification failed. Please contact support.");
        } finally {
          setIsLoading(false);
        }
      };

      verifyPayment();
    }
  }, [location.search, navigate]);

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

  const handleMpesaPayment = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!validateStep()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      const payload = {
        name: user.name,
        email: user.email,
        amount: amount,
        callbackUrl: `${window.location.origin}/donate?paymentSuccess=true`,
        donorId: user.id,
        schoolId: schoolId,
        type: donationType,
      };

      const response = await axios.post(
        `${API_URL}/api/paystack/initialize`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        setSuccess("Payment initiated successfully!");
        window.location.href = response.data.data.authorizationUrl;
      }
    } catch (error) {
      console.error("Payment error:", error.response?.data || error.message);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to initiate payment. Please try again."
      );
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
            <h4
              className="text-center mb-4"
              style={{ color: themeStyles.textPrimary }}
            >
              Select a School to Support
            </h4>
            <Form.Group className="mb-4">
              <Form.Label
                className="fw-bold"
                style={{ color: themeStyles.textSecondary }}
              >
                <FontAwesomeIcon icon={faSchool} className="me-2" />
                Choose a School
              </Form.Label>
              <Form.Select
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                className="form-control-lg"
                disabled={isLoading}
                style={{
                  backgroundColor: themeStyles.inputBg,
                  color: themeStyles.textPrimary,
                  borderColor: themeStyles.inputBorder,
                }}
              >
                <option value="">Select a school to support</option>
                {schools.map((school) => (
                  <option key={school._id} value={school._id}>
                    {school.schoolName}
                  </option>
                ))}
              </Form.Select>
              <div
                className="mt-2 small"
                style={{ color: themeStyles.textMuted }}
              >
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
            <h4
              className="text-center mb-4"
              style={{ color: themeStyles.textPrimary }}
            >
              <Badge bg="success" className="me-2">
                School Selected:
              </Badge>
              {getSelectedSchool().schoolName}
            </h4>

            <Form.Group className="mb-4">
              <Form.Label
                className="fw-bold"
                style={{ color: themeStyles.textSecondary }}
              >
                Donation Type
              </Form.Label>
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
                          ? themeStyles.cardSelectedBg
                          : themeStyles.cardBg,
                      borderColor:
                        donationType === "money"
                          ? "#3b82f6"
                          : themeStyles.borderColor,
                      borderWidth: donationType === "money" ? "2px" : "1px",
                      transition: "all 0.2s ease",
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
                            donationType === "money"
                              ? "#3b82f6"
                              : themeStyles.textMuted,
                        }}
                      />
                      <h5 style={{ color: themeStyles.textPrimary }}>
                        Money Donation
                      </h5>
                      <p
                        className="small mb-0"
                        style={{ color: themeStyles.textMuted }}
                      >
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
                          ? themeStyles.cardSelectedBg
                          : themeStyles.cardBg,
                      borderColor:
                        donationType === "items"
                          ? "#3b82f6"
                          : themeStyles.borderColor,
                      borderWidth: donationType === "items" ? "2px" : "1px",
                      transition: "all 0.2s ease",
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
                            donationType === "items"
                              ? "#3b82f6"
                              : themeStyles.textMuted,
                        }}
                      />
                      <h5 style={{ color: themeStyles.textPrimary }}>
                        Item Donation
                      </h5>
                      <p
                        className="small mb-0"
                        style={{ color: themeStyles.textMuted }}
                      >
                        Donate books, supplies, or equipment
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Form.Group>

            {donationType === "money" && (
              <Form.Group className="mb-4">
                <Form.Label
                  className="fw-bold"
                  style={{ color: themeStyles.textSecondary }}
                >
                  <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" />
                  Amount (KES)
                </Form.Label>
                <Form.Control
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter donation amount"
                  className="form-control-lg"
                  style={{
                    backgroundColor: themeStyles.inputBg,
                    color: themeStyles.textPrimary,
                    borderColor: themeStyles.inputBorder,
                  }}
                  required
                />
                <div className="d-flex justify-content-between mt-2">
                  {[500, 1000, 2500, 5000].map((value) => (
                    <Button
                      key={value}
                      variant={themeStyles.buttonOutline}
                      size="sm"
                      onClick={() => setAmount(value.toString())}
                      className="flex-grow-1 mx-1"
                    >
                      {value.toLocaleString()} KES
                    </Button>
                  ))}
                </div>
              </Form.Group>
            )}

            {donationType === "items" && (
              <>
                <Form.Group className="mb-4">
                  <Form.Label
                    className="fw-bold"
                    style={{ color: themeStyles.textSecondary }}
                  >
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
                    style={{
                      backgroundColor: themeStyles.inputBg,
                      color: themeStyles.textPrimary,
                      borderColor: themeStyles.inputBorder,
                    }}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label
                    className="fw-bold"
                    style={{ color: themeStyles.textSecondary }}
                  >
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                    Preferred Delivery Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="form-control-lg"
                    style={{
                      backgroundColor: themeStyles.inputBg,
                      color: themeStyles.textPrimary,
                      borderColor: themeStyles.inputBorder,
                    }}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </Form.Group>
              </>
            )}

            <Row className="mt-4">
              <Col xs={6}>
                <Button
                  variant={themeStyles.buttonOutline}
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
            <h4
              className="text-center mb-4"
              style={{ color: themeStyles.textPrimary }}
            >
              Review & Submit Your Donation
            </h4>

            <Card
              className="mb-4"
              style={{
                backgroundColor: themeStyles.cardBg,
                borderColor: themeStyles.borderColor,
              }}
            >
              <Card.Header
                style={{
                  backgroundColor: themeStyles.bgSecondary,
                  borderColor: themeStyles.borderColor,
                }}
              >
                <h5 className="mb-0" style={{ color: themeStyles.textPrimary }}>
                  Donation Summary
                </h5>
              </Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col xs={4} style={{ color: themeStyles.textMuted }}>
                    School:
                  </Col>
                  <Col
                    xs={8}
                    style={{
                      color: themeStyles.textPrimary,
                      fontWeight: "bold",
                    }}
                  >
                    {getSelectedSchool().schoolName}
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col xs={4} style={{ color: themeStyles.textMuted }}>
                    Donation Type:
                  </Col>
                  <Col
                    xs={8}
                    style={{
                      color: themeStyles.textPrimary,
                      fontWeight: "bold",
                    }}
                  >
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
                    <Col xs={4} style={{ color: themeStyles.textMuted }}>
                      Amount:
                    </Col>
                    <Col
                      xs={8}
                      style={{
                        color: themeStyles.textPrimary,
                        fontWeight: "bold",
                      }}
                    >
                      {amount} KES
                    </Col>
                  </Row>
                )}

                {donationType === "items" && (
                  <>
                    <Row className="mb-3">
                      <Col xs={4} style={{ color: themeStyles.textMuted }}>
                        Items:
                      </Col>
                      <Col
                        xs={8}
                        style={{
                          color: themeStyles.textPrimary,
                          fontWeight: "bold",
                        }}
                      >
                        {items.split(",").map((item, index) => (
                          <Badge bg="info" className="me-1 mb-1" key={index}>
                            {item.trim()}
                          </Badge>
                        ))}
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col xs={4} style={{ color: themeStyles.textMuted }}>
                        Delivery Date:
                      </Col>
                      <Col
                        xs={8}
                        style={{
                          color: themeStyles.textPrimary,
                          fontWeight: "bold",
                        }}
                      >
                        {new Date(preferredDate).toLocaleDateString()}
                      </Col>
                    </Row>
                  </>
                )}
              </Card.Body>
            </Card>

            <Row className="mt-4">
              <Col xs={6}>
                <Button
                  variant={themeStyles.buttonOutline}
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

  if (paymentStatus === "success") {
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
                className="shadow-lg text-center p-5"
                style={{
                  backgroundColor: darkMode
                    ? "rgba(30, 41, 59, 0.95)"
                    : "rgba(255, 255, 255, 0.95)",
                  borderRadius: "15px",
                }}
              >
                <div className="mb-4">
                  <div
                    className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                    style={{
                      width: "100px",
                      height: "100px",
                      backgroundColor: "#28a745",
                      color: "white",
                    }}
                  >
                    <FontAwesomeIcon icon={faHandHoldingUsd} size="3x" />
                  </div>
                </div>
                <h2
                  className="mb-3"
                  style={{ color: darkMode ? "#f8fafc" : "#1e293b" }}
                >
                  Thank You for Your Donation!
                </h2>
                <p
                  className="lead mb-4"
                  style={{ color: darkMode ? "#e2e8f0" : "#334155" }}
                >
                  Your generous contribution will make a real difference.
                </p>
                <p style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
                  You will be redirected to your dashboard in a few seconds...
                </p>
                <Button
                  variant="primary"
                  className="mt-3"
                  onClick={() => navigate("/donor-dashboard")}
                >
                  Go to Dashboard Now
                </Button>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  if (paymentStatus === "verifying") {
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
                className="shadow-lg text-center p-5"
                style={{
                  backgroundColor: darkMode
                    ? "rgba(30, 41, 59, 0.95)"
                    : "rgba(255, 255, 255, 0.95)",
                  borderRadius: "15px",
                }}
              >
                <div className="mb-4">
                  <Spinner
                    animation="border"
                    variant="primary"
                    className="mb-3"
                  />
                </div>
                <h2 style={{ color: darkMode ? "#f8fafc" : "#1e293b" }}>
                  Verifying your payment...
                </h2>
                <p style={{ color: darkMode ? "#e2e8f0" : "#334155" }}>
                  Please wait while we confirm your donation.
                </p>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  if (paymentStatus === "error") {
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
                  backgroundColor: darkMode
                    ? "rgba(30, 41, 59, 0.95)"
                    : "rgba(255, 255, 255, 0.95)",
                  borderRadius: "15px",
                }}
              >
                <Card.Body className="p-5 text-center">
                  <Alert variant="danger">
                    <h3>Payment Verification Error</h3>
                    <p>
                      We couldn't verify your payment. This could be because:
                    </p>
                    <ul
                      className="text-start"
                      style={{ color: darkMode ? "#1e293b" : "" }}
                    >
                      <li>The payment was cancelled</li>
                      <li>
                        There was a technical issue with the payment processor
                      </li>
                      <li>The transaction reference is missing or invalid</li>
                    </ul>
                  </Alert>
                  <Button
                    variant="primary"
                    className="mt-3"
                    onClick={() => navigate("/donor-dashboard")}
                  >
                    Return to Dashboard
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

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
                backgroundColor: darkMode
                  ? "rgba(30, 41, 59, 0.95)"
                  : "rgba(255, 255, 255, 0.95)",
                borderRadius: "15px",
                overflow: "hidden",
              }}
            >
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
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                {isLoading && (
                  <Alert variant="info">Processing your request...</Alert>
                )}

                <Form onSubmit={(e) => e.preventDefault()}>{renderStep()}</Form>
              </Card.Body>

              <Card.Footer
                className="py-3 text-center"
                style={{ backgroundColor: darkMode ? "#0f172a" : "#f8fafc" }}
              >
                <Button
                  variant="link"
                  size="sm"
                  style={{ color: darkMode ? "#94a3b8" : "#64748b" }}
                  onClick={() => navigate("/donor-dashboard")}
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="me-1" />
                  Return to Dashboard
                </Button>

                <Button
                  variant="link"
                  size="sm"
                  style={{ color: darkMode ? "#94a3b8" : "#64748b" }}
                  className="ms-3"
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
