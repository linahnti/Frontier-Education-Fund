import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";
import { toast } from "react-toastify";

const Logout = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    logout(); // Call the logout function from AuthContext
    toast.success("Logged out successfully!", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      style: { backgroundColor: "#ffc107", color: "#000" },
    });
    navigate("/login"); // Redirect to login after logout
  }, [logout, navigate]);

  return null; // This component doesn't render anything
};

export default Logout;
