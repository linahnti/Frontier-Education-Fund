import React from "react";
import { Link } from "react-router-dom";
import assets from "../assets/images/assets";

const HomepageNavbar = () => {
  return (
    <header
      className="shadow-sm py-2"
      style={{ background: "linear-gradient(to right, #6b7280, #4b5563)" }}
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
          <a href="#about" className="text-white text-decoration-none me-3">
            About
          </a>
          <a href="#schools" className="text-white text-decoration-none me-3">
            Schools
          </a>
          <a href="#donations" className="text-white text-decoration-none me-3">
            Donations
          </a>
          <a
            href="#testimonials"
            className="text-white text-decoration-none me-3"
          >
            Testimonials
          </a>
        </div>

        {/* Login and Signup Buttons */}
        <div>
          <Link
            to="/login"
            className="btn btn-warning rounded-pill px-3 py-1 text-dark text-decoration-none me-2"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="btn btn-warning rounded-pill px-3 py-1 text-dark text-decoration-none"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
};

export default HomepageNavbar;
