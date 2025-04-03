import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/users/verify-email/${token}`
        );
        setMessage(response.data.message);
        toast.success(response.data.message);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (err) {
        console.error("Verification error:", err.response?.data);
        setError(
          err.response?.data?.message || "Email verification failed. Please try again."
        );
        toast.error(
          err.response?.data?.message || "Email verification failed. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg" style={{ maxWidth: "450px", width: "100%" }}>
        <div
          className="card-header text-center"
          style={{ background: "#4a6da7", padding: "20px 0" }}
        >
          <h2 className="mb-0" style={{ color: "white", fontWeight: "600" }}>
            Email Verification
          </h2>
        </div>
        <div className="card-body p-4 text-center">
          {loading ? (
            <div className="d-flex justify-content-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <>
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
              <button
                className="btn btn-primary mt-3"
                onClick={() => navigate("/login")}
              >
                Go to Login
              </button>
            </>
          ) : (
            <>
              <div className="alert alert-success">
                <i className="bi bi-check-circle-fill me-2"></i>
                {message}
              </div>
              <p>Redirecting to login page...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;