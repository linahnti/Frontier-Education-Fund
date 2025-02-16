import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
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
      console.log("API Response:", response.data); // Debugging
      console.log("User Role:", user.role); // Debugging

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect user based on role
      const role = user.role.toLowerCase();
      if (role === "admin") {
        navigate("/admin-dashboard");
      } else if (role === "donor") {
        navigate("/donor-dashboard");
      } else if (role === "school") {
        navigate("/school-dashboard");
      } else {
        console.error("Unknown role:", user.role); // Debugging
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Login failed. Please try again.");
      }
      console.error("Login error:", err); // Debugging
    }
  };

  return (
    <div
      className="auth-container d-flex justify-content-center align-items-center min-vh-100"
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
        className="card p-4 shadow-lg text-white "
        style={{
          maxWidth: "400px",
          width: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
        }}
      >
        <h3 className="text-center mb-4" style={{ color: "#ffc107" }}>
          Login
        </h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-black">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label text-black">Password</label>
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
        <p className="text-center mt-3 text-black">
          <a
            href="/forgot-password"
            className="text-warning"
            style={{ color: "#ffc107" }}
          >
            Forgot Password?
          </a>
        </p>
        <p className="text-center text-black">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-warning"
            style={{ color: "#ffc107" }}
          >
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
