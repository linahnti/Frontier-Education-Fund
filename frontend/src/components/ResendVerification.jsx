import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../config";

const ResendVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userId, setUserId] = useState(location.state?.userId || "");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/users/resend-verification`,
        { userId }
      );
      toast.success(response.data.message);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      console.error("Error resending verification:", err.response?.data);
      toast.error(
        err.response?.data?.message || "Failed to resend verification email"
      );
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
          style={{ background: "#4a6da7", padding: "20px 0" }}
        >
          <h2 className="mb-0" style={{ color: "white", fontWeight: "600" }}>
            Resend Verification Email
          </h2>
        </div>
        <div className="card-body p-4">
          <p className="text-muted text-center mb-4">
            Enter your email address to resend the verification email.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                placeholder="Email address"
                required
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
                  ></span>
                  Sending...
                </>
              ) : (
                "Resend Verification Email"
              )}
            </button>
            <div className="mt-3 text-center">
              <button
                className="btn btn-link text-decoration-none"
                onClick={() => navigate("/login")}
              >
                <i className="bi bi-arrow-left me-1"></i> Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResendVerification;
