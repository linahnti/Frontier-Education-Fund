import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import assets from "../assets/images/assets";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form Data:", formData);
    console.log("Error:", error);

    // Clear previous errors
    setError("");

    // Check if role is selected
    if (!formData.role) {
      toast.error("Please select your role!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: { backgroundColor: "#ffc107", color: "#000" },
      });
      return;
    }

    // Validate phone number format (must start with a country code and be exactly 12 digits)
    const phoneRegex = /^\+\d{12}$/; // Example: +254712345678 (12 digits total)
    if (!phoneRegex.test(formData.contactNumber)) {
      toast.error(
        "Please provide a valid phone number starting with a country code and exactly 12 digits (e.g., +254712345678).",
        {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: { backgroundColor: "#ffc107", color: "#000" },
        }
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: { backgroundColor: "#ffc107", color: "#000" },
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine first and last name
      const name = `${formData.firstName} ${formData.lastName}`;

      // Send a POST request to the backend
      const response = await axios.post(
        "http://localhost:5000/api/users/register",
        {
          name,
          email: formData.email,
          contactNumber: formData.contactNumber,
          password: formData.password,
          role: formData.role,
        }
      );

      // Show success toast in the center of the screen
      toast.success("Registration successful! Redirecting to login...", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: { backgroundColor: "#007bff", color: "#fff" },
      });

      // Redirect to the login page
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      console.error("Registration error:", err.response?.data);

      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${assets.sunrise2})`,
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
          maxWidth: "600px",
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
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          {/* First Name and Last Name (Side by Side) */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
          </div>

          {/* Email and Phone Number (Side by Side) */}
          <div className="row mb-3">
            <div className="col-md-6">
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
            <div className="col-md-6">
              <label htmlFor="contactNumber" className="form-label">
                Contact Number
              </label>
              <input
                type="text"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className="form-control"
                placeholder="Start with country code, e.g., +254712345678"
                required
              />
            </div>
          </div>

          {/* Password and Confirm Password (Side by Side) */}
          <div className="row mb-3">
            <div className="col-md-6">
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
            <div className="col-md-6">
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
              {error === "Passwords do not match!" && (
                <div className="text-danger mt-2">Passwords do not match!</div>
              )}
            </div>
          </div>

          {/* Role Selection (Full Width) */}
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
              <option value="" disabled>
                Select your role
              </option>
              <option value="donor">Donor</option>
              <option value="school">School</option>
            </select>
            {error === "Please select a role" && (
              <div className="text-danger mt-2">Please select a role.</div>
            )}
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

      {/* Toast Container */}
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Register;
