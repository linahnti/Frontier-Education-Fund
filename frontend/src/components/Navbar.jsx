import React, { useState } from "react";
import { Link } from "react-router-dom";
import assets from "../assets/images/assets";

const Navbar = ({ isLoggedIn, userRole }) => {
  const [notifications, setNotifications] = useState([]); // Empty notifications array

  const handleLogout = () => {
    console.log("User logged out");
    // Add logout logic here (e.g., clear session, redirect to login page)
  };

  return (
    <header
      className="shadow-sm py-2"
      style={{
        background: "linear-gradient(to right, #6b7280, #4b5563)", // Darker gray gradient
      }}
    >
      <div className="container-fluid d-flex justify-content-between align-items-center">
        {/* Logo and Text */}
        <div className="d-flex align-items-center">
          <img
            src={assets.favicon} // Logo
            alt="Frontier Education Fund Logo"
            className="h-8 w-8 me-2" // Adjust size with custom CSS if needed
          />
          <span className="h5 text-white mb-0">Frontier Education Fund</span>
        </div>

        {/* Navbar Links */}
        <div className="d-flex align-items-center">
          <a
            href="#about"
            className="text-white text-decoration-none me-3"
            style={{ fontSize: "0.9rem" }}
          >
            About
          </a>
          <a
            href="#schools"
            className="text-white text-decoration-none me-3"
            style={{ fontSize: "0.9rem" }}
          >
            Schools
          </a>
          <a
            href="#donations"
            className="text-white text-decoration-none me-3"
            style={{ fontSize: "0.9rem" }}
          >
            Donations
          </a>
          <a
            href="#testimonials"
            className="text-white text-decoration-none me-3"
            style={{ fontSize: "0.9rem" }}
          >
            Testimonials
          </a>
        </div>

        {/* Right Side: Conditional Rendering */}
        <div className="d-flex align-items-center">
          {isLoggedIn ? (
            <>
              {/* Notifications Dropdown */}
              <div className="dropdown me-3">
                <button
                  className="btn btn-link text-white p-0 dropdown-toggle"
                  type="button"
                  id="notificationsDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  aria-label="Notifications"
                >
                  <i className="fas fa-bell" style={{ fontSize: "1rem" }}></i>
                  {notifications.length > 0 && (
                    <span className="badge bg-danger rounded-pill ms-1">
                      {notifications.length}
                    </span>
                  )}
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-end"
                  aria-labelledby="notificationsDropdown"
                >
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <li key={notification.id}>
                        <a className="dropdown-item" href="#">
                          {notification.message}
                        </a>
                      </li>
                    ))
                  ) : (
                    <li>
                      <a className="dropdown-item" href="#">
                        No new notifications
                      </a>
                    </li>
                  )}
                </ul>
              </div>

              {/* Profile Dropdown */}
              <div className="dropdown">
                <button
                  className="btn btn-link text-white p-0 dropdown-toggle"
                  type="button"
                  id="profileDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  aria-label="Profile"
                >
                  <i
                    className="fas fa-user-circle"
                    style={{ fontSize: "1.2rem" }}
                  ></i>
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-end"
                  aria-labelledby="profileDropdown"
                >
                  <li>
                    <Link to="/profile" className="dropdown-item">
                      Profile
                    </Link>
                  </li>
                  {userRole === "admin" && (
                    <li>
                      <Link to="/admin-settings" className="dropdown-item">
                        Admin Settings
                      </Link>
                    </li>
                  )}
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            // Sign-Up Button (Visible when not logged in)
            <Link
              to="/signup"
              className="btn btn-warning rounded-pill px-3 py-1 text-dark text-decoration-none"
              style={{
                fontSize: "0.9rem",
                fontWeight: "bold",
              }}
            >
              Sign Up
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
