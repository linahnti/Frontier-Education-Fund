import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import assets from "../assets/images/assets";
import { motion } from "framer-motion";

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
  const [typingEffect, setTypingEffect] = useState(true);
  const navigate = useNavigate();

  // Animation variants
  const containerAnimation = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const formAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut",
      },
    }),
  };

  const buttonAnimation = {
    idle: { scale: 1 },
    hover: {
      scale: 1.05,
      boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  // Typing effect for welcome text
  const welcomeText = "Join Frontier Education Fund";
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (typingEffect) {
      let i = 0;
      const typing = setInterval(() => {
        setDisplayText(welcomeText.substring(0, i));
        i++;
        if (i > welcomeText.length) {
          clearInterval(typing);
          setTypingEffect(false);
        }
      }, 100);

      return () => clearInterval(typing);
    }
  }, [typingEffect]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFocus = (id) => {
    if (id) {
      document.getElementById(id).classList.add("text-warning");
    }
  };

  const handleBlur = (id) => {
    if (id) {
      document.getElementById(id).classList.remove("text-warning");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 50px",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        }}
      ></div>

      {/* Left Section: Animated Text */}
      <div
        className="text-section"
        style={{
          width: "40%",
          color: "#fff",
          textAlign: "left",
          padding: "20px",
          marginRight: "20px",
          zIndex: 1,
        }}
      >
        <h1
          style={{
            fontSize: "3.5rem",
            fontWeight: "bold",
            whiteSpace: "normal",
            overflow: "hidden",
          }}
        >
          {typingEffect ? (
            <span>
              {displayText}
              <span className="text-warning">|</span>
            </span>
          ) : (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Join Frontier Education Fund
            </motion.span>
          )}
        </h1>

        <motion.p
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          transition={{ duration: 2, delay: 2, ease: "easeInOut" }}
          style={{
            fontSize: "1.5rem",
            color: "#007BFF",
            marginTop: "20px",
            overflow: "hidden",
            whiteSpace: "normal",
          }}
        >
          Be part of our mission to transform education access in
          underprivileged communities.
        </motion.p>

        {/* Added benefits section with animations */}
        <motion.div
          className="mt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.8 }}
        >
          <h4 className="text-warning mb-4">Why Join Us?</h4>

          <motion.div
            className="mb-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 3, duration: 0.5 }}
          >
            <h5 className="text-white">
              <i className="bi bi-check-circle-fill text-warning me-2"></i>Make
              Real Impact
            </h5>
            <p className="text-white-50 ps-4">
              Your contributions directly support schools and students in need.
            </p>
          </motion.div>

          <motion.div
            className="mb-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 3.2, duration: 0.5 }}
          >
            <h5 className="text-white">
              <i className="bi bi-graph-up-arrow text-warning me-2"></i>Track
              Your Contribution
            </h5>
            <p className="text-white-50 ps-4">
              See the real-time impact of your donations with transparent
              reporting.
            </p>
          </motion.div>

          <motion.div
            className="mb-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 3.4, duration: 0.5 }}
          >
            <h5 className="text-white">
              <i className="bi bi-people-fill text-warning me-2"></i>Join a
              Community
            </h5>
            <p className="text-white-50 ps-4">
              Connect with like-minded individuals passionate about education.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Section: Registration Form with animations */}
      <motion.div
        className="container"
        initial="hidden"
        animate="visible"
        variants={containerAnimation}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderRadius: "15px",
          padding: "30px",
          maxWidth: "600px",
          width: "55%",
          zIndex: 1,
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        }}
      >
        <motion.h2
          className="text-center mb-4"
          variants={formAnimation}
          custom={0}
          style={{
            fontWeight: "bold",
            fontSize: "2.5rem",
            color: "#007BFF",
          }}
        >
          <i className="bi bi-person-plus-fill me-2 text-warning"></i>Create
          Account
        </motion.h2>

        {error && (
          <motion.div
            className="alert alert-danger"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          {/* First Name and Last Name (Side by Side) */}
          <div className="row mb-3">
            <div className="col-md-6">
              <motion.div variants={formAnimation} custom={1}>
                <label htmlFor="firstName" className="form-label">
                  <i id="firstNameIcon" className="bi bi-person me-2"></i>First
                  Name
                </label>
                <motion.input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onFocus={() => handleFocus("firstNameIcon")}
                  onBlur={() => handleBlur("firstNameIcon")}
                  className="form-control"
                  whileFocus={{
                    boxShadow: "0 0 0 0.25rem rgba(255, 193, 7, 0.25)",
                  }}
                  required
                />
              </motion.div>
            </div>
            <div className="col-md-6">
              <motion.div variants={formAnimation} custom={2}>
                <label htmlFor="lastName" className="form-label">
                  <i id="lastNameIcon" className="bi bi-person-badge me-2"></i>
                  Last Name
                </label>
                <motion.input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onFocus={() => handleFocus("lastNameIcon")}
                  onBlur={() => handleBlur("lastNameIcon")}
                  className="form-control"
                  whileFocus={{
                    boxShadow: "0 0 0 0.25rem rgba(255, 193, 7, 0.25)",
                  }}
                  required
                />
              </motion.div>
            </div>
          </div>

          {/* Email and Phone Number (Side by Side) */}
          <div className="row mb-3">
            <div className="col-md-6">
              <motion.div variants={formAnimation} custom={3}>
                <label htmlFor="email" className="form-label">
                  <i id="emailIcon" className="bi bi-envelope me-2"></i>Email
                </label>
                <motion.input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => handleFocus("emailIcon")}
                  onBlur={() => handleBlur("emailIcon")}
                  className="form-control"
                  whileFocus={{
                    boxShadow: "0 0 0 0.25rem rgba(255, 193, 7, 0.25)",
                  }}
                  required
                />
              </motion.div>
            </div>
            <div className="col-md-6">
              <motion.div variants={formAnimation} custom={4}>
                <label htmlFor="contactNumber" className="form-label">
                  <i id="phoneIcon" className="bi bi-telephone me-2"></i>Contact
                  Number
                </label>
                <motion.input
                  type="text"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  onFocus={() => handleFocus("phoneIcon")}
                  onBlur={() => handleBlur("phoneIcon")}
                  className="form-control"
                  placeholder="+254712345678"
                  whileFocus={{
                    boxShadow: "0 0 0 0.25rem rgba(255, 193, 7, 0.25)",
                  }}
                  required
                />
                <small className="text-muted">
                  Format: +Country Code + Number (12 digits)
                </small>
              </motion.div>
            </div>
          </div>

          {/* Password and Confirm Password (Side by Side) */}
          <div className="row mb-3">
            <div className="col-md-6">
              <motion.div variants={formAnimation} custom={5}>
                <label htmlFor="password" className="form-label">
                  <i id="passwordIcon" className="bi bi-lock me-2"></i>Password
                </label>
                <div className="input-group">
                  <motion.input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => handleFocus("passwordIcon")}
                    onBlur={() => handleBlur("passwordIcon")}
                    className="form-control"
                    whileFocus={{
                      boxShadow: "0 0 0 0.25rem rgba(255, 193, 7, 0.25)",
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i
                      className={`bi ${
                        showPassword ? "bi-eye-slash" : "bi-eye"
                      }`}
                    ></i>
                  </button>
                </div>
              </motion.div>
            </div>
            <div className="col-md-6">
              <motion.div variants={formAnimation} custom={6}>
                <label htmlFor="confirmPassword" className="form-label">
                  <i
                    id="confirmPasswordIcon"
                    className="bi bi-shield-lock me-2"
                  ></i>
                  Confirm Password
                </label>
                <div className="input-group">
                  <motion.input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => handleFocus("confirmPasswordIcon")}
                    onBlur={() => handleBlur("confirmPasswordIcon")}
                    className="form-control"
                    whileFocus={{
                      boxShadow: "0 0 0 0.25rem rgba(255, 193, 7, 0.25)",
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i
                      className={`bi ${
                        showConfirmPassword ? "bi-eye-slash" : "bi-eye"
                      }`}
                    ></i>
                  </button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Role Selection with visual cues */}
          <motion.div variants={formAnimation} custom={7} className="mb-4">
            <label htmlFor="role" className="form-label">
              <i id="roleIcon" className="bi bi-person-badge me-2"></i>Register
              As
            </label>
            <div className="row">
              <div className="col-md-6">
                <motion.div
                  className={`card mb-2 ${
                    formData.role === "donor" ? "border-warning" : ""
                  }`}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setFormData({ ...formData, role: "donor" })}
                  style={{ cursor: "pointer" }}
                >
                  <div className="card-body text-center">
                    <i
                      className="bi bi-heart-fill text-danger mb-2"
                      style={{ fontSize: "2rem" }}
                    ></i>
                    <h5>Donor</h5>
                    <small className="text-muted">
                      Support schools with donations
                    </small>
                    <div className="mt-2">
                      <input
                        type="radio"
                        name="role"
                        id="donorRole"
                        value="donor"
                        checked={formData.role === "donor"}
                        onChange={handleChange}
                        className="form-check-input me-2"
                      />
                      <label htmlFor="donorRole">Select</label>
                    </div>
                  </div>
                </motion.div>
              </div>
              <div className="col-md-6">
                <motion.div
                  className={`card mb-2 ${
                    formData.role === "school" ? "border-warning" : ""
                  }`}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setFormData({ ...formData, role: "school" })}
                  style={{ cursor: "pointer" }}
                >
                  <div className="card-body text-center">
                    <i
                      className="bi bi-building-fill text-primary mb-2"
                      style={{ fontSize: "2rem" }}
                    ></i>
                    <h5>School</h5>
                    <small className="text-muted">
                      Register your school for support
                    </small>
                    <div className="mt-2">
                      <input
                        type="radio"
                        name="role"
                        id="schoolRole"
                        value="school"
                        checked={formData.role === "school"}
                        onChange={handleChange}
                        className="form-check-input me-2"
                      />
                      <label htmlFor="schoolRole">Select</label>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Submit Button with animation */}
          <motion.div variants={formAnimation} custom={8}>
            <motion.button
              type="submit"
              className="btn btn-primary w-100 py-2"
              variants={buttonAnimation}
              whileHover="hover"
              disabled={isSubmitting}
              style={{
                background: "#007BFF",
                border: "none",
                borderRadius: "10px",
                fontSize: "1.1rem",
              }}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Creating Account...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Complete Registration
                </>
              )}
            </motion.button>
          </motion.div>
        </form>

        {/* Sign In Section */}
        <motion.div
          className="text-center mt-4"
          variants={formAnimation}
          custom={9}
        >
          <p>
            Already have an account?{" "}
            <motion.a
              href="/login"
              whileHover={{ scale: 1.05 }}
              style={{
                color: "#ffc107",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              <i className="bi bi-box-arrow-in-right me-1"></i>
              Sign In
            </motion.a>
          </p>
        </motion.div>
      </motion.div>

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
