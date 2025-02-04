import React from "react";
import { Link } from "react-router-dom";
import assets from "../assets/images/assets";

const Navbar = () => {
  return (
    <header className="bg-dark bg-gradient shadow-md py-4 px-4 px-md-5">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        {/* Logo and Text */}
        <div className="d-flex align-items-center ms-0">
          <img
            src={assets.favicon} // Logo
            alt="Frontier Education Fund Logo"
            className="h-8 w-8 mr-2" // Adjust size with 'h-10' and 'w-10'
          />
          <span className="h5 text-white">Frontier Education Fund</span>
        </div>

        {/* Navbar Links */}
        <div className="bg-indigo-600 p-2 rounded d-flex">
          <a
            href="#about"
            className="text-white ms-3 
          text-decoration-none hover:text-indigo-200"
          >
            About
          </a>
          <a
            href="#schools"
            className="text-white ms-3
          text-decoration-none hover:text-indigo-200"
          >
            Schools
          </a>
          <a
            href="#donations"
            className="text-white ms-3
          text-decoration-none hover:text-indigo-200"
          >
            Donations
          </a>
          <a
            href="#testimonials"
            className="text-white ms-3
          text-decoration-none hover:text-indigo-200"
          >
            Testimonials
          </a>
        </div>

        {/* Sign-Up Button */}
        <li className="ms-3 d-flex align-items-center">
          <Link
            to="/signup"
            className="btn btn-primary rounded-pill px-4 py-2 text-white text-decoration-none"
            style={{
              fontSize: "1rem",
              fontWeight: "bold",
            }}
          >
            Sign Up
          </Link>
        </li>
      </div>
    </header>
  );
};

export default Navbar;
