import React from "react";
import { Link, useNavigate } from "react-router-dom";
import assets from "../assets/images/assets";
import ThemeToggle from "./ThemeToggle";
import { Dropdown, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faSignOutAlt,
  faCog,
  faUserCircle,
  faTachometerAlt,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/AuthenticatedNavbar.css";

const AuthenticatedNavbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user ? user.role : null;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleLogoClick = () => {
    if (userRole === "admin") {
      navigate("/admin-dashboard");
    } else if (userRole === "school") {
      navigate("/school-dashboard");
    } else if (userRole === "donor") {
      navigate("/donor-dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  const renderNavLinks = () => {
    const commonLinks = (
      <>
        <Link to="/about" className="nav-link text-white mx-2 hover-effect">
          About
        </Link>
        <Link to="/schools" className="nav-link text-white mx-2 hover-effect">
          Schools
        </Link>
        <Link to="/donations" className="nav-link text-white mx-2 hover-effect">
          Donations
        </Link>
        <Link
          to="/testimonials"
          className="nav-link text-white mx-2 hover-effect"
        >
          Testimonials
        </Link>
      </>
    );

    // Role-specific dashboard links
    if (userRole === "donor") {
      return (
        <>
          {commonLinks}
          <Link
            to="/donor-dashboard"
            className="nav-link text-white mx-2 hover-effect"
          >
            <FontAwesomeIcon icon={faTachometerAlt} className="me-1" />{" "}
            Dashboard
          </Link>
        </>
      );
    } else if (userRole === "school") {
      return (
        <>
          {commonLinks}
          <Link
            to="/school-dashboard"
            className="nav-link text-white mx-2 hover-effect"
          >
            <FontAwesomeIcon icon={faTachometerAlt} className="me-1" />{" "}
            Dashboard
          </Link>
        </>
      );
    } else if (userRole === "admin") {
      return (
        <>
          {commonLinks}
          <Link
            to="/admin-dashboard"
            className="nav-link text-white mx-2 hover-effect"
          >
            <FontAwesomeIcon icon={faTachometerAlt} className="me-1" /> Admin
            Dashboard
          </Link>
        </>
      );
    }

    return commonLinks;
  };

  return (
    <header
      className="py-3"
      style={{
        background: "linear-gradient(135deg, #1E293B, #374151)",
        boxShadow:
          "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
      }}
    >
      <div className="container-fluid d-flex justify-content-between align-items-center">
        {/* Logo and Title */}
        <div
          className="d-flex align-items-center"
          style={{ cursor: "pointer" }}
          onClick={handleLogoClick}
        >
          <img
            src={assets.favicon}
            alt="Frontier Education Fund Logo"
            className="me-2"
            style={{ height: "40px", width: "auto" }}
          />
          <span
            className="h4 text-white mb-0 fw-bold"
            style={{
              background: "linear-gradient(90deg, #ffffff, #a5b4fc)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Frontier Education Fund
          </span>
        </div>

        {/* Navbar Links */}
        <div className="d-none d-md-flex align-items-center">
          {renderNavLinks()}
        </div>

        {/* Right Section: Theme Toggle and User Menu */}
        <div className="d-flex align-items-center">
          <ThemeToggle className="mx-2 d-flex align-items-center gap-3" />

          {/* User Menu Dropdown */}
          <Dropdown>
            <Dropdown.Toggle
              variant="link"
              id="dropdown-user"
              className="nav-link text-white p-0 d-flex align-items-center"
              style={{ background: "none", border: "none" }}
            >
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle bg-light d-flex align-items-center justify-content-center me-1"
                  style={{ width: "36px", height: "36px", overflow: "hidden" }}
                >
                  <FontAwesomeIcon
                    icon={faUserCircle}
                    size="lg"
                    className="text-primary"
                  />
                </div>
                <span className="d-none d-md-inline ms-1">
                  {user?.name || "User"}
                </span>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu align="end" className="shadow-lg border-0 py-0">
              <div className="p-3 border-bottom bg-light">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-3"
                    style={{ width: "45px", height: "45px" }}
                  >
                    <FontAwesomeIcon
                      icon={faUser}
                      size="lg"
                      className="text-white"
                    />
                  </div>
                  <div>
                    <h6 className="mb-0">{user?.name || "User"}</h6>
                    <small className="text-muted">{user?.email || ""}</small>
                  </div>
                </div>
              </div>

              <Dropdown.Item as={Link} to="/profile" className="py-2">
                <FontAwesomeIcon icon={faUser} className="me-2" /> My Profile
              </Dropdown.Item>

              {user?.isProfileComplete && (
                <Dropdown.Item as={Link} to="/profile" className="py-2">
                  <FontAwesomeIcon icon={faCog} className="me-2" /> Account
                  Settings
                </Dropdown.Item>
              )}

              {userRole === "admin" && (
                <Dropdown.Item as={Link} to="/admin-settings" className="py-2">
                  <FontAwesomeIcon icon={faCog} className="me-2" /> Admin
                  Settings
                </Dropdown.Item>
              )}

              <Dropdown.Divider className="my-0" />

              <Dropdown.Item onClick={logout} className="py-2 text-danger">
                <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

export default AuthenticatedNavbar;
