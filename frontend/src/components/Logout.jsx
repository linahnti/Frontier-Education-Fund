import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";
import { toast } from "react-toastify";

const Logout = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    logout(); 
    toast.success("Logged out successfully!", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      style: { backgroundColor: "#ffc107", color: "#000" },
    });
    navigate("/login"); 
  }, [logout, navigate]);

  return null; 
};

export default Logout;
