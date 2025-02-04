import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import assets from "../assets/images/assets";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "donor", // Default role
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(""); // State for error messages
  const [isSubmitting, setIsSubmitting] = useState(false); // state for submit button
  const navigate = useNavigate(); // Initialize useNavigate

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setError("");

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setIsSubmitting(true); // Set submitting state to true

    try {
      // Send a POST request to the backend
      const response = await axios.post(
        "http://localhost:5000/api/users/register",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }
      );

      // Handle successful registration
      console.log("Registration successful:", response.data);
      alert("Registration successful! You can now log in.");

      // Redirect to the login page
      navigate("/login");
    } catch (err) {
      // Handle errors from the backend
      console.error("Registration error:", err.response?.data);

      // Extract the specific error message from the backend response
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage); // Display the specific error message
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${assets.sunrise2})`, // Use the imported image
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        className="container"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderRadius: "10px",
          padding: "20px",
          maxWidth: "500px",
        }}
      >
        <h2
          className="text-center mb-4"
          style={{
            fontFamily: "cursive",
            fontSize: "2.5rem",
            color: "#ffc107",
          }}
        >
          Register
        </h2>
        {/* Display error messages here */}
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <div className="input-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-control"
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div className="mb-3">
            <label htmlFor="role" className="form-label">
              Register As
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-select"
            >
              <option value="donor">Donor</option>
              <option value="school">School</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Sign In Section */}
        <div className="text-center mt-3">
          <p>
            Already have an account?{" "}
            <a
              href="/login"
              style={{ color: "#ffc107", textDecoration: "none" }}
            >
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
