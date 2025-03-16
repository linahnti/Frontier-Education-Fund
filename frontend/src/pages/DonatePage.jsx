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

const DonatePage = () => {
  const [donationType, setDonationType] = useState("money");
  const [amount, setAmount] = useState("");
  const [items, setItems] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [schools, setSchools] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch schools for the dropdown
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/schools");
        setSchools(response.data);
      } catch (error) {
        console.error("Error fetching schools:", error);
      }
    };

    fetchSchools();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const donorId = JSON.parse(localStorage.getItem("user")).id;

      const response = await axios.post(
        "http://localhost:5000/api/donations",
        {
          donorId,
          schoolId,
          type: donationType,
          amount: donationType === "money" ? amount : null,
          items: donationType === "items" ? items.split(",") : null,
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
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/api/mpesa/stkpush",
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

                  {/* Physical Donation Fields */}
                  {donationType === "items" && (
                    <Form.Group className="mb-3">
                      <Form.Label>Items (comma-separated)</Form.Label>
                      <Form.Control
                        type="text"
                        value={items}
                        onChange={(e) => setItems(e.target.value)}
                        required
                      />
                    </Form.Group>
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
