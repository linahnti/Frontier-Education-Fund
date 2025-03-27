import React from "react";
import { Link } from "react-router-dom";
import assets from "../assets/images/assets";
import ThemeToggle from "./ThemeToggle";

const HomepageNavbar = () => {
  return (
    <header
      className="shadow-sm py-2"
      style={{
        background: "linear-gradient(135deg, #1E3A8A, #3B82F6)",
      }}
    >
      <div className="container-fluid d-flex justify-content-between align-items-center">
        {/* Logo and Title */}
        <Link
          to="/"
          className="d-flex align-items-center text-decoration-none"
          style={{ cursor: "pointer" }}
        >
          <img
            src={assets.favicon}
            alt="Frontier Education Fund Logo"
            className="h-8 w-8 me-2"
          />
          <span className="h5 text-white mb-0 d-flex flex-column fw-bold">
            Frontier Education <br /> Fund
          </span>
        </Link>

        {/* Navbar Links */}
        <div className="d-flex align-items-center">
          <a
            href="#about"
            className="text-white text-decoration-none me-3 small-text"
          >
            About
          </a>
          <a
            href="#schools"
            className="text-white text-decoration-none me-3 small-text"
          >
            Schools
          </a>
          <a
            href="#donations"
            className="text-white text-decoration-none me-3 small-text"
          >
            Donations
          </a>
          <a
            href="#testimonials"
            className="text-white text-decoration-none me-3 small-text"
          >
            Testimonials
          </a>
          <a
            href="#footer-section"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("footer-section")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-white text-decoration-none small-text"
          >
            Contact
          </a>
        </div>

        {/* Theme Toggle and Auth Buttons */}
        <div className="d-flex align-items-center">
          <ThemeToggle className="text-white mx-2" />
          <Link
            to="/login"
            className="btn btn-warning rounded-pill px-3 py-1 text-dark text-decoration-none me-2 fw-bold"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="btn btn-warning rounded-pill px-3 py-1 text-dark text-decoration-none fw-bold"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
};

export default HomepageNavbar;
