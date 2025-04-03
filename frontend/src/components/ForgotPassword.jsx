import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    // Basic email validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/forgot-password/request",
        { email }
      );
      setMessage(response.data.message);
      setEmail(""); // Clear the email field after successful submission
    } catch (err) {
      console.error("Error:", err);
      if (err.response) {
        setError(err.response.data.message || "An error occurred.");
      } else if (err.request) {
        setError("No response from the server. Please try again.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div
        className="card shadow-lg"
        style={{ maxWidth: "450px", width: "100%" }}
      >
        <div
          className="card-header text-center"
          style={{ background: "#ffc107", padding: "20px 0" }}
        >
          <h2 className="mb-0" style={{ color: "white", fontWeight: "600" }}>
            Reset Your Password
          </h2>
        </div>

        <div className="card-body p-4">
          {message ? (
            <div className="text-center mb-4">
              <div className="alert alert-success">
                <i className="bi bi-check-circle-fill me-2"></i>
                {message}
              </div>
              <p>
                Please check your email inbox and spam folder for the reset
                link.
              </p>
              <Link to="/login" className="btn btn-outline-primary mt-3">
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <p className="text-muted text-center mb-4">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>

              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Email address"
                    required
                    autoComplete="email"
                  />
                  <label htmlFor="email">Email address</label>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2"
                  style={{ background: "#4a6da7", borderColor: "#4a6da7" }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                        style={{ color: "#0d6efd" }}
                      ></span>
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>

                <div className="mt-3 text-center">
                  <Link to="/login" className="text-decoration-none">
                    <i className="bi bi-arrow-left me-1"></i> Back to Login
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
