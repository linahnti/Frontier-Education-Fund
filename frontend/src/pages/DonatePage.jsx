import React, { useState, useEffect } from "react";
import {
  Form,
  Row,
  Col,
  Button,
  Alert,
  Container,
  Card,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import assets from "../assets/images/assets";
import { API_URL } from "../config";

const DonatePage = () => {
  const [donationType, setDonationType] = useState("money");
  const [amount, setAmount] = useState("");
  const [items, setItems] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [preferredDate, setPreferredDate] = useState(""); 
  const [schools, setSchools] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch schools on component mount
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/schools`);
        setSchools(response.data);
      } catch (error) {
        console.error("Error fetching schools:", error);
      }
    };

    fetchSchools();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate donation amount for monetary donations
    if (donationType === "money" && (isNaN(amount) || amount <= 0)) {
      setError(
        "Please enter a valid donation amount (must be greater than zero)."
      );
      return;
    }

    // Validate items and preferred date for item donations
    if (donationType === "items") {
      if (!items || items.trim() === "") {
        setError("Items cannot be empty for item donations.");
        return;
      }
      if (!preferredDate || isNaN(new Date(preferredDate).getTime())) {
        setError("Invalid preferred delivery date.");
        return;
      }
    }

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
        navigate("/donor-dashboard");
      }
    } catch (error) {
      console.error("Error submitting donation:", error);
      setError("Failed to submit donation. Please try again.");
    }
  };

  // Handle M-Pesa STK Push
  const handleMpesaPayment = async () => {
    // Validate donation amount before proceeding with M-Pesa payment
    if (isNaN(amount) || amount <= 0) {
      setError(
        "Please enter a valid donation amount (must be greater than zero)."
      );
      return;
    }

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
        alert(
          "M-Pesa STK push initiated. Check your phone to complete the payment."
        );
      }
    } catch (error) {
      console.error("Error initiating M-Pesa payment:", error);
      setError("Failed to initiate M-Pesa payment. Please try again.");
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${assets.background1})`, // Replace with your image URL
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container className="my-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card
              className="shadow-lg p-4"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
            >
              <Card.Body>
                <h2 className="text-center mb-4">Make a Donation</h2>
                <Form onSubmit={handleSubmit}>
                  {/* Donation Type */}
                  <Form.Group className="mb-3">
                    <Form.Label>Donation Type</Form.Label>
                    <div>
                      <Form.Check
                        inline
                        type="radio"
                        label="Money"
                        name="donationType"
                        value="money"
                        checked={donationType === "money"}
                        onChange={() => setDonationType("money")}
                      />
                      <Form.Check
                        inline
                        type="radio"
                        label="Items"
                        name="donationType"
                        value="items"
                        checked={donationType === "items"}
                        onChange={() => setDonationType("items")}
                      />
                    </div>
                  </Form.Group>

                  {/* School Selection */}
                  <Form.Group className="mb-3">
                    <Form.Label>Select School</Form.Label>
                    <Form.Select
                      value={schoolId}
                      onChange={(e) => setSchoolId(e.target.value)}
                      required
                    >
                      <option value="">Choose a school</option>
                      {schools.map((school) => (
                        <option key={school._id} value={school._id}>
                          {school.schoolName}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  {/* Monetary Donation Fields */}
                  {donationType === "money" && (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>Amount (KES)</Form.Label>
                        <Form.Control
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>M-Pesa Phone Number</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g., 0712345678 or 0112345678"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          required
                        />
                      </Form.Group>
                      <Button
                        variant="success"
                        onClick={handleMpesaPayment}
                        className="w-100 mb-3"
                      >
                        Pay via M-Pesa
                      </Button>
                    </>
                  )}

                  {/* Item Donation Fields */}
                  {donationType === "items" && (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>Items (comma-separated)</Form.Label>
                        <Form.Control
                          type="text"
                          value={items}
                          onChange={(e) => setItems(e.target.value)}
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Preferred Delivery Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          required
                        />
                      </Form.Group>
                    </>
                  )}

                  {/* Error Message */}
                  {error && <Alert variant="danger">{error}</Alert>}

                  {/* Submit Button */}
                  <Button variant="primary" type="submit" className="w-100">
                    Submit Donation
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DonatePage;
