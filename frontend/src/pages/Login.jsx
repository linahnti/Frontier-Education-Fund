import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion } from "framer-motion";
import assets from "../assets/images/assets";
import { API_URL } from "../config";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [typingEffect, setTypingEffect] = useState(true);
  const navigate = useNavigate();

  // Animation variants for form elements
  const formAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
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

  // Typing effect for the welcome text
  const welcomeText = "Welcome to Frontier Education Fund";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const TEST_EMAILS = [
      "hinata@gmail.com",
      "isagi11@gmail.com",
      "naruto@gmail.com",
      "ashito@gmail.com",
      "fefadmin@gmail.com",
    ];

    try {
      const response = await axios.post(`${API_URL}/api/users/login`, {
        email,
        password,
      });

      const { token, user } = response.data;
      console.log("API Response:", response.data);
      console.log("User Role:", user.role);

      if (TEST_EMAILS.includes(email)) {
        console.log("Bypassing verification for test account:", email);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        toast.success("Login successful! Redirecting to dashboard...");

        const role = user.role.toLowerCase();
        if (role === "admin") navigate("/admin-dashboard");
        else if (role === "donor") navigate("/donor-dashboard");
        else if (role === "school") navigate("/school-dashboard");
        return;
      }

      const profileResponse = await axios.get(`${API_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const completeUser = profileResponse.data;
      console.log("Complete User:", completeUser);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Login successful! Redirecting to dashboard...", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: { backgroundColor: "#ffc107", color: "#000" },
      });

      const role = user.role.toLowerCase();
      if (role === "admin") {
        navigate("/admin-dashboard");
      } else if (role === "donor") {
        navigate("/donor-dashboard");
      } else if (role === "school") {
        navigate("/school-dashboard");
      } else {
        console.error("Unknown role:", user.role);
      }
    } catch (err) {
      if (TEST_EMAILS.includes(email)) {
        console.log(
          "Test account login failed, attempting to force verify:",
          email
        );
        try {
          // Try to force verify the test account
          await axios.post(`${API_URL}/api/users/force-verify`, { email });
          // Retry login after verification
          const retryResponse = await axios.post(`${API_URL}/api/users/login`, {
            email,
            password,
          });
          const { token, user } = retryResponse.data;
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
          navigate(user.role.toLowerCase() + "-dashboard");
          return;
        } catch (forceVerifyError) {
          console.error("Force verify failed:", forceVerifyError);
        }
      }

      if (
        err.response &&
        err.response.status === 403 &&
        err.response.data.userId
      ) {
        navigate("/resend-verification", {
          state: { userId: err.response.data.userId },
        });
        return;
      } else if (
        err.response &&
        err.response.data &&
        err.response.data.message
      ) {
        setError(err.response.data.message);
      } else {
        setError("Login failed. Please try again.");
      }
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailFocus = () => {
    document.getElementById("emailIcon").classList.add("text-warning");
  };

  const handleEmailBlur = () => {
    document.getElementById("emailIcon").classList.remove("text-warning");
  };

  const handlePasswordFocus = () => {
    document.getElementById("passwordIcon").classList.add("text-warning");
  };

  const handlePasswordBlur = () => {
    document.getElementById("passwordIcon").classList.remove("text-warning");
  };

  return (
    <div
      className="auth-container d-flex justify-content-center align-items-center min-vh-100"
      style={{
        backgroundImage: `url(${assets.sunrise2})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 100px",
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
          width: "50%",
          color: "#fff",
          textAlign: "left",
          padding: "20px",
          marginRight: "50px",
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
              Welcome to Frontier Education Fund
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
          Bridging the gap between donors and underprivileged schools to ensure
          quality education for every child.
        </motion.p>

        {/* Added statistics section */}
        <motion.div
          className="mt-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 0.8 }}
        >
          <h4 className="text-warning mb-4">Our Impact</h4>
          <div className="d-flex justify-content-between">
            <div className="text-center me-4">
              <h2 className="text-white">500+</h2>
              <p className="text-white-50">Schools Supported</p>
            </div>
            <div className="text-center me-4">
              <h2 className="text-white">$2M+</h2>
              <p className="text-white-50">Funds Raised</p>
            </div>
            <div className="text-center">
              <h2 className="text-white">10K+</h2>
              <p className="text-white-50">Students Impacted</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Section: Login Form with animations */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={formAnimation}
        className="card p-4 shadow-lg text-white"
        style={{
          maxWidth: "400px",
          width: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderRadius: "15px",
          zIndex: 1,
        }}
      >
        <h3 className="text-center mb-4" style={{ color: "#000" }}>
          <i className="bi bi-lock-fill me-2 text-warning"></i>Login
        </h3>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="alert alert-danger"
          >
            {error}
          </motion.div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" style={{ color: "#000" }}>
              <i id="emailIcon" className="bi bi-envelope me-2"></i>Email
            </label>
            <motion.input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              onFocus={handleEmailFocus}
              onBlur={handleEmailBlur}
              whileFocus={{
                boxShadow: "0 0 0 0.25rem rgba(255, 193, 7, 0.25)",
              }}
              variants={formAnimation}
            />
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ color: "#000" }}>
              <i id="passwordIcon" className="bi bi-key me-2"></i>Password
            </label>
            <div className="input-group">
              <motion.input
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                onFocus={handlePasswordFocus}
                onBlur={handlePasswordBlur}
                variants={formAnimation}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i
                  className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                ></i>
              </button>
            </div>
          </div>
          <motion.button
            type="submit"
            className="btn btn-primary w-100"
            variants={buttonAnimation}
            whileHover="hover"
            disabled={loading}
            style={{
              background: "#007BFF",
              border: "none",
              padding: "10px",
              borderRadius: "10px",
            }}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </motion.button>
        </form>
        <motion.p
          className="text-center mt-3"
          style={{ color: "#000" }}
          variants={formAnimation}
        >
          <a
            href="/forgot-password"
            className="text-warning"
            style={{ color: "#ffc107", textDecoration: "none" }}
          >
            <i className="bi bi-question-circle me-1"></i>Forgot Password?
          </a>
        </motion.p>
        <motion.p
          className="text-center"
          style={{ color: "#000" }}
          variants={formAnimation}
        >
          Don't have an account?{" "}
          <a
            href="/signup"
            className="text-warning"
            style={{ color: "#ffc107", textDecoration: "none" }}
          >
            <i className="bi bi-person-plus me-1"></i>Register here
          </a>
        </motion.p>
      </motion.div>

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

export default Login;
