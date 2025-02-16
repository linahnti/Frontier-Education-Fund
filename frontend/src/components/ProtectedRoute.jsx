import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ allowedRole }) => {
  const location = useLocation();

  // Get user authentication details from localStorage
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = !!token;
  const userRole = user ? user.role : null;

  // Redirect to login if not logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Redirect if user role doesn't match the allowed role
  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  // Render the protected route
  return <Outlet />;
};

export default ProtectedRoute;
