import React from "react";
import { Link, useNavigate } from "react-router-dom";
import assets from "../assets/images/assets";

const AuthenticatedNavbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user ? user.role : null;

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header
      className="shadow-sm py-2"
      style={{ background: "#005f8f" }} // Deep blue background
    >
      <div className="container-fluid d-flex justify-content-between align-items-center">
        {/* Logo and Title */}
        <div className="d-flex align-items-center">
          <img
            src={assets.favicon}
            alt="Frontier Education Fund Logo"
            className="h-8 w-8 me-2"
          />
          <span className="h5 text-white mb-0">Frontier Education Fund</span>
        </div>

        {/* Navbar Links */}
        <div className="d-flex align-items-center">
          <Link to="/about" className="text-white text-decoration-none me-3">
            About
          </Link>
          <Link to="/schools" className="text-white text-decoration-none me-3">
            Schools
          </Link>
          <Link
            to="/donations"
            className="text-white text-decoration-none me-3"
          >
            Donations
          </Link>
          <Link
            to="/testimonials"
            className="text-white text-decoration-none me-3"
          >
            Testimonials
          </Link>
        </div>

        {/* Profile and Notifications */}
        <div className="d-flex align-items-center">
          <div className="dropdown me-3">
            <button
              className="btn btn-link text-white p-0 dropdown-toggle"
              type="button"
              id="notificationsDropdown"
              data-bs-toggle="dropdown"
            >
              <i className="fas fa-bell"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <span className="dropdown-item">No new notifications</span>
              </li>
            </ul>
          </div>

          {/* Profile Dropdown */}
          <div className="dropdown">
            <button
              className="btn btn-link text-white p-0 dropdown-toggle"
              type="button"
              id="profileDropdown"
              data-bs-toggle="dropdown"
            >
              <i className="fas fa-user-circle"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <Link to="/profile" className="dropdown-item">
                  Profile
                </Link>
              </li>
              {user?.isProfileComplete && (
                <li>
                  <Link to="/profile" className="dropdown-item">
                    Profile Completed
                  </Link>
                </li>
              )}
              {userRole === "admin" && (
                <li>
                  <Link to="/admin-settings" className="dropdown-item">
                    Admin Settings
                  </Link>
                </li>
              )}
              <li>
                <button className="dropdown-item" onClick={logout}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AuthenticatedNavbar;
