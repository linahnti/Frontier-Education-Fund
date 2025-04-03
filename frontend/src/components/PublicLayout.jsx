import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./HomepageNavbar";
import Footer from "./Footer";

const PublicLayout = () => {
  const location = useLocation();

  // Routes where navbar should be hidden (now using path patterns)
  const shouldHideNavbar = () => {
    const hiddenPaths = [
      "/login",
      "/signup",
      "/forgot-password",
      "/resend-verification",
    ];

    // Special handling for dynamic routes
    const isVerifyEmailRoute = location.pathname.startsWith("/verify-email");
    const isResetPasswordRoute =
      location.pathname.startsWith("/reset-password");

    return (
      hiddenPaths.includes(location.pathname) ||
      isVerifyEmailRoute ||
      isResetPasswordRoute
    );
  };

  return (
    <div>
      {/* Conditionally render the Navbar */}
      {!shouldHideNavbar() && <Navbar />}

      {/* Main Content */}
      <div className="content">
        <Outlet />
      </div>

      {/* Footer - optional to hide here too */}
      {!shouldHideNavbar() && <Footer />}
    </div>
  );
};

export default PublicLayout;
