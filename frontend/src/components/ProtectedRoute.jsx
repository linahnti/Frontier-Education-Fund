import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";

const ProtectedRoute = ({ element, allowedRole }) => {
  const { isLoggedIn, userRole } = useContext(AuthContext);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

export default ProtectedRoute;
