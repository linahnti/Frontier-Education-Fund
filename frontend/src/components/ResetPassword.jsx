import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Verify token on component mount
    const verifyToken = async () => {
      try {
        // Optional: verify token validity on the server
        // This would be a new endpoint you might want to add
        /* await axios.get(`http://localhost:5000/api/forgot-password/verify/${token}`); */
      } catch (err) {
        setTokenValid(false);
        setError("Invalid or expired reset link. Please request a new one.");
      }
    };

    if (token) {
      verifyToken();
    } else {
      setTokenValid(false);
      setError("Reset token is missing.");
    }
  }, [token]);

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    // Validate passwords
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters long, with at least one uppercase letter, one number, and one special character."
      );
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/forgot-password/reset/${token}`,
        { password }
      );
      setMessage(response.data.message);
      // Redirect to login after successful password reset
      setTimeout(() => {
        navigate("/login");
      }, 3000);
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

  if (!tokenValid) {
    return (
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div
          className="card shadow-lg"
          style={{ maxWidth: "450px", width: "100%" }}
        >
          <div
            className="card-header text-center"
            style={{ background: "#4a6da7", padding: "20px 0" }}
          >
            <h2 className="mb-0" style={{ color: "white", fontWeight: "600" }}>
              Reset Password
            </h2>
          </div>
          <div className="card-body p-4 text-center">
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
            <Link to="/forgot-password" className="btn btn-primary mt-3">
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div
        className="card shadow-lg"
        style={{ maxWidth: "450px", width: "100%" }}
      >
        <div
          className="card-header text-center"
          style={{ background: "#4a6da7", padding: "20px 0" }}
        >
          <h2 className="mb-0" style={{ color: "white", fontWeight: "600" }}>
            Reset Password
          </h2>
        </div>

        <div className="card-body p-4">
          {message ? (
            <div className="text-center mb-4">
              <div className="alert alert-success">
                <i className="bi bi-check-circle-fill me-2"></i>
                {message}
              </div>
              <p>Redirecting to login page...</p>
            </div>
          ) : (
            <>
              <p className="text-muted text-center mb-4">
                Please enter your new password.
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
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control"
                    placeholder="New password"
                    required
                  />
                  <label htmlFor="password">New password</label>
                </div>

                <div className="form-floating mb-3">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-control"
                    placeholder="Confirm password"
                    required
                  />
                  <label htmlFor="confirmPassword">Confirm password</label>
                </div>

                <div className="mb-3">
                  <div className="password-strength-info">
                    <small className="text-muted">
                      Password must have at least:
                    </small>
                    <ul className="text-muted small mt-1">
                      <li>8 characters</li>
                      <li>One uppercase letter (A-Z)</li>
                      <li>One lowercase letter (a-z)</li>
                      <li>One number (0-9)</li>
                      <li>One special character (!@#$%^&*)</li>
                    </ul>
                  </div>
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
                      ></span>
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
