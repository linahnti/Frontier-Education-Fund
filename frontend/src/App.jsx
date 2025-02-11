import React, { lazy, Suspense, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthContext } from "./components/AuthContext"; // Import context
import PublicLayout from "./components/PublicLayout";
import GeneralLayout from "./components/GeneralLayout";
import "./App.css";

// Lazy load components
const Home = lazy(() => import("./pages/Home"));
const Signup = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const Logout = lazy(() => import("./components/Logout"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const ResetPassword = lazy(() => import("./components/ResetPassword"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const DonorDashboard = lazy(() => import("./pages/DonorDashboard"));
const SchoolDashboard = lazy(() => import("./pages/SchoolDashboard"));

// Protected Route Component (Updated)
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

// Custom Loading Component
const Loading = () => (
  <div className="centered-container">
    <h1 className="text-warning">Loading...</h1>
  </div>
);

// Custom 404 Page
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
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/logout" element={<Logout />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<GeneralLayout />}>
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute
                  element={<AdminDashboard />}
                  allowedRole="admin"
                />
              }
            />
            <Route
              path="/donor-dashboard"
              element={
                <ProtectedRoute
                  element={<DonorDashboard />}
                  allowedRole="donor"
                />
              }
            />
            <Route
              path="/school-dashboard"
              element={
                <ProtectedRoute
                  element={<SchoolDashboard />}
                  allowedRole="school"
                />
              }
            />
          </Route>

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
