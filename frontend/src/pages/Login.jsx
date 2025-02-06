import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // For making HTTP requests
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the CSS
import assets from "../assets/images/assets";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(""); // To display error message if login fails
  const navigate = useNavigate(); // Hook to handle navigation

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send a POST request to the backend
      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      // Handle successful login
      console.log("Login successful:", response.data);
      setError(""); // Clear any previous errors
      localStorage.setItem("token", response.data.token); // Save the token in localStorage
      localStorage.setItem("userRole", response.data.user.role); // Store user role in localStorage

      // Show success toast
      toast.success("Login successful!", {
        position: "top-center",
        autoClose: 3000, // Close after 3 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: { backgroundColor: "#ffc107", color: "#000" }, // Custom yellow toast
      });

      // Delay navigation by 3 seconds
      setTimeout(() => {
        const userRole = response.data.user.role;
        if (userRole === "admin") {
          navigate("/admin-dashboard"); // Redirect to admin dashboard
        } else if (userRole === "school") {
          navigate("/school-dashboard"); // Redirect to school dashboard
        } else if (userRole === "donor") {
          navigate("/donor-dashboard"); // Redirect to donor dashboard
        } else {
          navigate("/dashboard"); // Default redirect (if needed)
        }
      }, 2000); // 2-second delay
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Login failed. Please try again.");
      }

      // Show error toast
      toast.error("Login failed. Please check your credentials.", {
        position: "top-center",
        autoClose: 3000, // Close after 3 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: { backgroundColor: "#ffc107", color: "#000" }, // Yellow background
      });
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
          Login
        </h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
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

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>

        {/* Forgot Password Section */}
        <div className="text-center mt-3">
          <p>
            Forgot your password?{" "}
            <a
              href="/forgot-password"
              style={{ color: "#ffc107", textDecoration: "none" }}
            >
              Click here
            </a>
          </p>
        </div>

        {/* Sign Up Section */}
        <div className="text-center mt-3">
          <p>
            Don't have an account?{" "}
            <a
              href="/signup"
              style={{ color: "#ffc107", textDecoration: "none" }}
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-center" // Position the toast in the center
        autoClose={3000} // Close after 3 seconds
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
