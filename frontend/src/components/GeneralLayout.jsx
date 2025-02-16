import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./AuthenticatedNavbar";
import Footer from "./Footer";

const GeneralLayout = () => {
  // Check authentication from localStorage
  const isLoggedIn = !!localStorage.getItem("token");

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
