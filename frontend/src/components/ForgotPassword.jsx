import React, { useState } from "react";
import axios from "axios"; // for making HTTP requests

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send a POST request to backend for password reset
      const response = await axios.post(
        "http://localhost:5000/api/users/forgot-password", // Adjust the API endpoint as needed
        { email }
      );
      setMessage(response.data.message); // Set success message
      setError(""); // Clear error message
    } catch (err) {
      setMessage(""); // Clear success message
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message); // Display error message from backend
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div
      className="container"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: "10px",
        padding: "20px",
        maxWidth: "500px",
        marginTop: "100px",
      }}
    >
      <h2 className="text-center mb-4" style={{ color: "#ffc107" }}>
        Forgot Password
      </h2>

      {/* Success or error message */}
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Enter your email address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Send Reset Link
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
