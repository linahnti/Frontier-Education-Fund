import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import "../styles/Modal.css";

const DonorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Fetch user data from localStorage or backend on component mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get("http://localhost:5000/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const userData = response.data;
          userData.isProfileComplete = Boolean(userData.isProfileComplete); // Ensure boolean
          localStorage.setItem("user", JSON.stringify(userData)); // Update localStorage
          setUser(userData);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  // Function to handle link clicks
  const handleLinkClick = (e, path) => {
    if (loading || !user) {
      console.log("Loading or user not available yet"); // Debugging log
      return; // Prevent premature checks before data is loaded
    }

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

  if (loading) {
    return <p>Loading...</p>; // Display a loading message while fetching user data
  }

  console.log("Rendered User:", user); // Debugging log
  console.log("isProfileComplete:", user?.isProfileComplete); // Debugging log

  return (
    <div className="container mt-5">
      <h2>Welcome to the Donor Dashboard</h2>
      <p>Here you can make donations, view your donation history, and explore schools in need.</p>

      {/* Links */}
      <div className="d-flex gap-3 mt-3">
        <a
          href="#"
          onClick={(e) => handleLinkClick(e, "/make-donation")}
          className="btn btn-primary"
        >
          Make a Donation
        </a>
        <a
          href="#"
          onClick={(e) => handleLinkClick(e, "/donation-history")}
          className="btn btn-info"
        >
          View Donation History
        </a>
        <a
          href="#"
          onClick={(e) => handleLinkClick(e, "/profile")}
          className="btn btn-success"
        >
          Manage Donor Profile
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
            onClick={handleCloseModal}
            className="modal-button-custom"
          >
            Go to Profile
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DonorDashboard;