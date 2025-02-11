import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./HomepageNavbar"; // Ensure this is your homepage navbar
import Footer from "./Footer";

const PublicLayout = () => {
  const location = useLocation();

  // List of routes where the navbar should NOT appear
  const noNavbarRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];

  return (
    <div>
      {/* Conditionally render the Navbar */}
      {!noNavbarRoutes.includes(location.pathname) && <Navbar />}

      {/* Main Content */}
      <div className="content">
        <Outlet />
      </div>

      {/* Footer (Optional) */}
      <Footer />
    </div>
  );
};

export default PublicLayout;
