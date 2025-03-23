import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion } from "framer-motion";
// import "../styles/Login.css";
import assets from "../assets/images/assets";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        {
          email,
          password,
        }
      );

      const { token, user } = response.data;
      console.log("API Response:", response.data);
      console.log("User Role:", user.role);

      const profileResponse = await axios.get(
        "http://localhost:5000/api/users/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Login failed. Please try again.");
      }
      console.error("Login error:", err);
    }
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
        justifyContent: "space-between", // Split the page into two sections
        alignItems: "center",
        padding: "0 100px", // Add padding to the sides
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.4)", // Dark overlay
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
          marginRight: "50px", // Add space between text and login form
        }}
      >
        <motion.h1
          initial={{ width: 0 }} // Start with no width (hidden)
          animate={{ width: "100%" }} // Expand to full width
          transition={{ duration: 3, ease: "easeInOut" }} // Animation duration and easing
          style={{
            fontSize: "3.5rem",
            fontWeight: "bold",
            whiteSpace: "normal", // Prevent text from wrapping
            overflow: "hidden", // Hide overflow text
          }}
        >
          Welcome to Frontier Education Fund
        </motion.h1>
        <motion.p
          initial={{ width: 0, opacity: 0 }} // Start with no width and invisible
          animate={{ width: "100%", opacity: 1 }} // Expand to full width and fade in
          transition={{ duration: 3, ease: "easeInOut" }} // Animation duration and easing
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
      </div>

      {/* Right Section: Login Form */}
      <div
        className="card p-4 shadow-lg text-white"
        style={{
          maxWidth: "400px",
          width: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
        }}
      >
        <h3 className="text-center mb-4" style={{ color: "#000" }}>
          Login
        </h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" style={{ color: "#000" }}>
              Email
            </label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ color: "#000" }}>
              Password
            </label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
        <p className="text-center mt-3" style={{ color: "#000" }}>
          <a
            href="/forgot-password"
            className="text-warning"
            style={{ color: "#ffc107" }}
          >
            Forgot Password?
          </a>
        </p>
        <p className="text-center" style={{ color: "#000" }}>
          Don't have an account?{" "}
          <a
            href="/signup"
            className="text-warning"
            style={{ color: "#ffc107" }}
          >
            Register here
          </a>
        </p>
      </div>

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
