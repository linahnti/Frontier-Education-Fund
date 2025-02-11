import React, { useContext } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./AuthenticatedNavbar"; // Authenticated Navbar
import Footer from "./Footer"; // Footer
import { AuthContext } from "./AuthContext"; // Ensure AuthContext is working properly

const GeneralLayout = () => {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <div>
      <Navbar />
      <div className="content" style={{ minHeight: "calc(100vh - 100px)" }}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default GeneralLayout;
