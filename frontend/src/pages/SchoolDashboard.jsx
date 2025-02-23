import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import "../styles/Modal.css";

const SchoolDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [localStorageUpdated, setLocalStorageUpdated] = useState(false); // New state to track localStorage changes

  // Fetch user data from localStorage on component mount or when localStorage changes
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        // Ensure isProfileComplete is a boolean
        parsedUser.isProfileComplete = Boolean(parsedUser.isProfileComplete);

        console.log("Parsed User:", parsedUser); // Debugging log
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
      }
    }
    setLoading(false); // Mark loading as false after fetching
  }, [localStorageUpdated]); // Re-run this effect when localStorageUpdated changes

  // Function to handle link clicks
  const handleLinkClick = (e, path) => {
    if (loading || !user) return; // Prevent premature checks before data is loaded

    if (!user.isProfileComplete) {
      e.preventDefault();
      setShowModal(true); // Show the modal if profile is incomplete
      return; // Prevent navigation if profile is incomplete
    }

    navigate(path); // Navigate to the intended path if profile is complete
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Function to refresh the component when localStorage changes
  const refreshDashboard = () => {
    setLocalStorageUpdated((prev) => !prev); // Toggle the state to force a re-render
  };

  if (loading) {
    return <p>Loading...</p>; // Display a loading message while fetching user data
  }

  return (
    <div className="container mt-5">
      <h2>Welcome to the School Dashboard</h2>
      <p>Here you can manage your school profile and post donation requests.</p>

      {/* Links */}
      <div className="d-flex gap-3 mt-3">
        <a
          href="#"
          onClick={(e) => handleLinkClick(e, "/post-donation")}
          className="btn btn-primary"
        >
          Post a Donation Request
        </a>
        <a
          href="#"
          onClick={(e) => handleLinkClick(e, "/donations-received")}
          className="btn btn-info"
        >
          View Donations Received
        </a>
        <a
          href="#"
          onClick={(e) => handleLinkClick(e, "/profile")}
          className="btn btn-success"
        >
          Manage School Profile
        </a>
      </div>

      {/* Modal for Incomplete Profile */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title className="modal-title-custom">
            Profile Incomplete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <p>
            Please complete your profile to access all features. Click the
            button below to go to your profile.
          </p>
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button
            variant="primary"
            as={Link}
            to="/profile"
            onClick={() => {
              handleCloseModal();
              refreshDashboard(); // Refresh the dashboard after navigating to the profile
            }}
            className="modal-button-custom"
          >
            Go to Profile
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SchoolDashboard;
