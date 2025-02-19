import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";
import GeneralLayout from "./components/GeneralLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Signup = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const Logout = lazy(() => import("./components/Logout"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const ResetPassword = lazy(() => import("./components/ResetPassword"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const DonorDashboard = lazy(() => import("./pages/DonorDashboard"));
const SchoolDashboard = lazy(() => import("./pages/SchoolDashboard"));
const Dashboard = lazy(() => import("./components/Dashboard"));

// Loading Component
const Loading = () => (
  <div className="centered-container">
    <h1 className="text-warning">Loading...</h1>
  </div>
);

// 404 Page
const NotFound = () => (
  <div className="centered-container">
    <div>
      <h1 className="text-warning">404 - Page Not Found</h1>
      <a href="/login" className="btn btn-warning mt-4">
        Go to Login
      </a>
    </div>
  </div>
);

const App = () => {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* ✅ Public Routes - No protection needed */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/logout" element={<Logout />} />
          </Route>

          {/* ✅ Protected Routes - Require authentication */}
          <Route element={<GeneralLayout />}>
            {/* Dashboard */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            {/* Admin Dashboard */}
            <Route element={<ProtectedRoute allowedRole="admin" />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
            </Route>

            {/* Donor Dashboard */}
            <Route element={<ProtectedRoute allowedRole="donor" />}>
              <Route path="/donor-dashboard" element={<DonorDashboard />} />
            </Route>

            {/* School Dashboard */}
            <Route element={<ProtectedRoute allowedRole="school" />}>
              <Route path="/school-dashboard" element={<SchoolDashboard />} />
            </Route>

            {/* Profile Page */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* ✅ Catch-All 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
