import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Card, Alert, Spinner, Button } from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../config";

const PaymentCompletePage = () => {
  const [status, setStatus] = useState("verifying");
  const [error, setError] = useState(null);
  const [donationData, setDonationData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setStatus("error");
          setError("Authentication required");
          navigate("/login");
          return;
        }

        const queryParams = new URLSearchParams(location.search);
        const reference = queryParams.get("reference") || queryParams.get("trxref");
        
        if (!reference) {
          setStatus("error");
          setError("Missing payment reference");
          return;
        }

        const response = await axios.get(
          `${API_URL}/api/paystack/verify?reference=${reference}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data?.status === "success") {
          setStatus("success");
          setDonationData(response.data.data);
          
          // Create notification
          try {
            const user = JSON.parse(localStorage.getItem("user"));
            await axios.post(
              `${API_URL}/api/notifications`,
              {
                userId: user.id,
                type: "donation_success",
                title: "Donation Received",
                message: `Thank you for your donation of ${response.data.data.amount} KES`,
                read: false,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
          } catch (notificationError) {
            console.error("Notification error:", notificationError);
          }

          setTimeout(() => {
            navigate("/donor-dashboard", {
              state: { donationSuccess: true }
            });
          }, 3000);
        } else {
          setStatus("error");
          setError(response.data?.message || "Payment verification failed");
        }
      } catch (error) {
        console.error("Payment error:", error.response?.data || error);
        setStatus("error");
        setError(
          error.response?.data?.message || 
          "Payment verification failed. Please check your payment history."
        );
      }
    };

    verifyPayment();
  }, [navigate, location.search]);

  return (
    <Container className="py-5">
      <Card className="shadow-lg">
        <Card.Body className="p-5 text-center">
          {status === "verifying" && (
            <>
              <Spinner animation="border" variant="primary" className="mb-3" />
              <h2>Verifying Payment...</h2>
              <p>Please wait while we confirm your donation</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mb-4">
                <div className="rounded-circle bg-success d-inline-flex align-items-center justify-content-center" 
                  style={{ width: "100px", height: "100px" }}>
                  <span className="display-4 text-white">✓</span>
                </div>
              </div>
              <h2>Payment Successful!</h2>
              <p className="lead">
                Thank you for your donation of {donationData?.amount} KES
              </p>
              <p className="text-muted">
                You'll be redirected to your dashboard shortly...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mb-4">
                <div className="rounded-circle bg-danger d-inline-flex align-items-center justify-content-center" 
                  style={{ width: "100px", height: "100px" }}>
                  <span className="display-4 text-white">✗</span>
                </div>
              </div>
              <Alert variant="danger">
                <h3>Payment Verification Failed</h3>
                <p>{error}</p>
                <div className="mt-3">
                  <Button
                    variant="primary"
                    onClick={() => navigate("/donate")}
                    className="me-2"
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate("/donor-dashboard")}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </Alert>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PaymentCompletePage;