import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Signup from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import DonorDashboard from "./pages/DonorDashboard";
import SchoolDashboard from "./pages/SchoolDashboard";

const App = () => {
  const userRole = localStorage.getItem("userRole");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route
          path="/admin-dashboard"
          element={userRole === "admin" ? <AdminDashboard /> : <Login />}
        />
        <Route
          path="/school-dashboard"
          element={userRole === "school" ? <SchoolDashboard /> : <Login />}
        />
        <Route
          path="/donor-dashboard"
          element={userRole === "donor" ? <DonorDashboard /> : <Login />}
        />
      </Routes>
    </Router>
  );
};

export default App;
