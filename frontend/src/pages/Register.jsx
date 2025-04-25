import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import assets from "../assets/images/assets";
import { motion } from "framer-motion";
import { API_URL } from "../config";
import { useTheme } from "../contexts/ThemeContext";

const Register = () => {
  const { darkMode } = useTheme();
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

  // Dynamic colors based on theme
  const themeStyles = {
    backgroundColor: darkMode
      ? "rgba(30, 41, 59, 0.9)"
      : "rgba(255, 255, 255, 0.9)",
    textColor: darkMode ? "#f8fafc" : "#1e293b",
    labelColor: darkMode ? "#cbd5e1" : "#64748b",
    cardBackground: darkMode ? "#1e293b" : "#f8fafc",
    cardBorder: darkMode ? "#334155" : "#e2e8f0",
    buttonBg: darkMode ? "#3b82f6" : "#2563eb",
    buttonHover: darkMode ? "#60a5fa" : "#3b82f6",
    overlayBg: darkMode ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.4)",
    roleCardBg: darkMode ? "#1e293b" : "#ffffff",
    roleCardHover: darkMode ? "#334155" : "#f1f5f9",
    roleText: darkMode ? "#e2e8f0" : "#334155",
    roleSubtext: darkMode ? "#94a3b8" : "#64748b",
  };

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
      boxShadow: darkMode
        ? "0px 5px 15px rgba(0, 0, 0, 0.3)"
        : "0px 5px 15px rgba(0, 0, 0, 0.1)",
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
    setError("");

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

    const phoneRegex = /^\+\d{12}$/;
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
      const name = `${formData.firstName} ${formData.lastName}`;
      const response = await axios.post(`${API_URL}/api/users/register`, {
        name,
        email: formData.email,
        contactNumber: formData.contactNumber,
        password: formData.password,
        role: formData.role,
      });

      toast.success("Registration successful! Redirecting to login...", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: { backgroundColor: "#007bff", color: "#fff" },
      });

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
          backgroundColor: themeStyles.overlayBg,
        }}
      ></div>

      {/* Left Section: Animated Text */}
      <div
        className="text-section"
        style={{
          width: "40%",
          color: themeStyles.textColor,
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
            color: darkMode ? "#60a5fa" : "#007BFF",
            marginTop: "20px",
            overflow: "hidden",
            whiteSpace: "normal",
          }}
        >
          Be part of our mission to transform education access in
          underprivileged communities.
        </motion.p>

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
            <h5 style={{ color: themeStyles.textColor }}>
              <i className="bi bi-check-circle-fill text-warning me-2"></i>Make
              Real Impact
            </h5>
            <p style={{ color: themeStyles.labelColor, paddingLeft: "1rem" }}>
              Your contributions directly support schools and students in need.
            </p>
          </motion.div>

          <motion.div
            className="mb-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 3.2, duration: 0.5 }}
          >
            <h5 style={{ color: themeStyles.textColor }}>
              <i className="bi bi-graph-up-arrow text-warning me-2"></i>Track
              Your Contribution
            </h5>
            <p style={{ color: themeStyles.labelColor, paddingLeft: "1rem" }}>
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
            <h5 style={{ color: themeStyles.textColor }}>
              <i className="bi bi-people-fill text-warning me-2"></i>Join a
              Community
            </h5>
            <p style={{ color: themeStyles.labelColor, paddingLeft: "1rem" }}>
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
          backgroundColor: themeStyles.backgroundColor,
          borderRadius: "15px",
          padding: "30px",
          maxWidth: "600px",
          width: "55%",
          zIndex: 1,
          boxShadow: darkMode
            ? "0 10px 25px rgba(0,0,0,0.4)"
            : "0 10px 25px rgba(0,0,0,0.2)",
        }}
      >
        <motion.h2
          className="text-center mb-4"
          variants={formAnimation}
          custom={0}
          style={{
            fontWeight: "bold",
            fontSize: "2.5rem",
            color: darkMode ? "#60a5fa" : "#007BFF",
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
                <label
                  htmlFor="firstName"
                  className="form-label"
                  style={{ color: themeStyles.labelColor }}
                >
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
                  style={{
                    backgroundColor: themeStyles.cardBackground,
                    color: themeStyles.textColor,
                    borderColor: themeStyles.cardBorder,
                  }}
                  whileFocus={{
                    boxShadow: "0 0 0 0.25rem rgba(255, 193, 7, 0.25)",
                  }}
                  required
                />
              </motion.div>
            </div>
            <div className="col-md-6">
              <motion.div variants={formAnimation} custom={2}>
                <label
                  htmlFor="lastName"
                  className="form-label"
                  style={{ color: themeStyles.labelColor }}
                >
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
                  style={{
                    backgroundColor: themeStyles.cardBackground,
                    color: themeStyles.textColor,
                    borderColor: themeStyles.cardBorder,
                  }}
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
                <label
                  htmlFor="email"
                  className="form-label"
                  style={{ color: themeStyles.labelColor }}
                >
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
                  style={{
                    backgroundColor: themeStyles.cardBackground,
                    color: themeStyles.textColor,
                    borderColor: themeStyles.cardBorder,
                  }}
                  whileFocus={{
                    boxShadow: "0 0 0 0.25rem rgba(255, 193, 7, 0.25)",
                  }}
                  required
                />
              </motion.div>
            </div>
            <div className="col-md-6">
              <motion.div variants={formAnimation} custom={4}>
                <label
                  htmlFor="contactNumber"
                  className="form-label"
                  style={{ color: themeStyles.labelColor }}
                >
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
                  style={{
                    backgroundColor: themeStyles.cardBackground,
                    color: themeStyles.textColor,
                    borderColor: themeStyles.cardBorder,
                  }}
                  whileFocus={{
                    boxShadow: "0 0 0 0.25rem rgba(255, 193, 7, 0.25)",
                  }}
                  required
                />
                <small style={{ color: themeStyles.labelColor }}>
                  Format: +Country Code + Number (12 digits)
                </small>
              </motion.div>
            </div>
          </div>

          {/* Password and Confirm Password (Side by Side) */}
          <div className="row mb-3">
            <div className="col-md-6">
              <motion.div variants={formAnimation} custom={5}>
                <label
                  htmlFor="password"
                  className="form-label"
                  style={{ color: themeStyles.labelColor }}
                >
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
                    style={{
                      backgroundColor: themeStyles.cardBackground,
                      color: themeStyles.textColor,
                      borderColor: themeStyles.cardBorder,
                    }}
                    whileFocus={{
                      boxShadow: "0 0 0 0.25rem rgba(255, 193, 7, 0.25)",
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    style={{
                      backgroundColor: themeStyles.cardBackground,
                      color: themeStyles.textColor,
                      borderColor: themeStyles.cardBorder,
                    }}
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
                <label
                  htmlFor="confirmPassword"
                  className="form-label"
                  style={{ color: themeStyles.labelColor }}
                >
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
                    style={{
                      backgroundColor: themeStyles.cardBackground,
                      color: themeStyles.textColor,
                      borderColor: themeStyles.cardBorder,
                    }}
                    whileFocus={{
                      boxShadow: "0 0 0 0.25rem rgba(255, 193, 7, 0.25)",
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    style={{
                      backgroundColor: themeStyles.cardBackground,
                      color: themeStyles.textColor,
                      borderColor: themeStyles.cardBorder,
                    }}
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
            <label
              htmlFor="role"
              className="form-label"
              style={{ color: themeStyles.labelColor }}
            >
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
                  style={{
                    cursor: "pointer",
                    backgroundColor: themeStyles.roleCardBg,
                    borderColor:
                      formData.role === "donor"
                        ? "#f59e0b"
                        : themeStyles.cardBorder,
                  }}
                >
                  <div className="card-body text-center">
                    <i
                      className="bi bi-heart-fill text-danger mb-2"
                      style={{ fontSize: "2rem" }}
                    ></i>
                    <h5 style={{ color: themeStyles.roleText }}>Donor</h5>
                    <small style={{ color: themeStyles.roleSubtext }}>
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
                      <label
                        htmlFor="donorRole"
                        style={{ color: themeStyles.roleText }}
                      >
                        Select
                      </label>
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
                  style={{
                    cursor: "pointer",
                    backgroundColor: themeStyles.roleCardBg,
                    borderColor:
                      formData.role === "school"
                        ? "#f59e0b"
                        : themeStyles.cardBorder,
                  }}
                >
                  <div className="card-body text-center">
                    <i
                      className="bi bi-building-fill text-primary mb-2"
                      style={{ fontSize: "2rem" }}
                    ></i>
                    <h5 style={{ color: themeStyles.roleText }}>School</h5>
                    <small style={{ color: themeStyles.roleSubtext }}>
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
                      <label
                        htmlFor="schoolRole"
                        style={{ color: themeStyles.roleText }}
                      >
                        Select
                      </label>
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
                background: themeStyles.buttonBg,
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
          <p style={{ color: themeStyles.labelColor }}>
            Already have an account?{" "}
            <motion.a
              href="/login"
              whileHover={{ scale: 1.05 }}
              style={{
                color: "#f59e0b",
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
