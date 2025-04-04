import React from "react";
import { Navbar, Nav, Container, Dropdown } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import "../styles/AdminDashboard.css";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === `/admin-dashboard${path}`;
  };

  return (
    <Navbar
      bg={darkMode ? "dark" : "light"}
      variant={darkMode ? "dark" : "light"}
      expand="lg"
      className="admin-navbar py-3 mb-4"
    >
      <Container>
        <Navbar.Brand
          as={Link}
          to="/admin-dashboard"
          className="d-flex align-items-center"
        >
          <i
            className="bi bi-grid-fill me-2"
            style={{ fontSize: "1.2rem" }}
          ></i>
          <span>Admin Dashboard</span>
        </Navbar.Brand>

        <div className="d-flex order-lg-last align-items-center">
          {/* Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="btn btn-link text-decoration-none me-2"
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {darkMode ? (
              <i className="bi bi-sun-fill" style={{ fontSize: "1.2rem" }}></i>
            ) : (
              <i className="bi bi-moon-fill" style={{ fontSize: "1.2rem" }}></i>
            )}
          </button>

          {/* Profile Dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle
              variant={darkMode ? "dark" : "light"}
              id="admin-profile-dropdown"
              className="d-flex align-items-center"
            >
              <i className="bi bi-person-circle me-1"></i>
              <span className="d-none d-sm-inline">Admin</span>
            </Dropdown.Toggle>
            <Dropdown.Menu className={darkMode ? "dropdown-menu-dark" : ""}>
              <Dropdown.Item as={Link} to="/admin-dashboard/profile">
                <i className="bi bi-person me-2"></i>Profile
              </Dropdown.Item>
              <Dropdown.Item as={Link} to="/admin-dashboard/settings">
                <i className="bi bi-gear me-2"></i>Settings
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/admin-dashboard/donations"
              className={isActive("/donations") ? "active" : ""}
            >
              <i className="bi bi-cash me-1"></i> Donations
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/admin-dashboard/donation-requests"
              className={isActive("/donation-requests") ? "active" : ""}
            >
              <i className="bi bi-inbox me-1"></i> Requests
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/admin-dashboard/schools"
              className={isActive("/schools") ? "active" : ""}
            >
              <i className="bi bi-building me-1"></i> Schools
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/admin-dashboard/users"
              className={isActive("/users") ? "active" : ""}
            >
              <i className="bi bi-people me-1"></i> Users
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/admin-dashboard/reports"
              className={isActive("/reports") ? "active" : ""}
            >
              <i className="bi bi-bar-chart me-1"></i> Reports
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;
