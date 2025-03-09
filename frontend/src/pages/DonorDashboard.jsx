import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Modal,
  Button,
  Card,
  ProgressBar,
  Tab,
  Tabs,
  Alert,
  Table,
  Row,
  Col,
} from "react-bootstrap";
import "../styles/Modal.css";
import ProfileCompletionProgress from "../components/ProfileCompletionProgress";
import Notifications from "../components/Notifications"; // Import the Notifications component

const DonorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [donations, setDonations] = useState([]);
  const [schools, setSchools] = useState([]);
  const [notifications, setNotifications] = useState([]); // Replace hardcoded notifications with an empty array
  const [activeTab, setActiveTab] = useState("donations");
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Function to refresh the user object from localStorage
  const refreshUser = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        parsedUser.isProfileComplete = Boolean(parsedUser.isProfileComplete);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
      }
    }
  };

  // Fetch user data from localStorage on component mount
  useEffect(() => {
    refreshUser(); // Fetch user data on mount
    setLoading(false);

    // Listen for the profileUpdated event
    window.addEventListener("profileUpdated", refreshUser);

    // Clean up the event listener
    return () => {
      window.removeEventListener("profileUpdated", refreshUser);
    };
  }, []);

  // Fetch notifications from the backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5000/api/donors/notifications",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  // Example data for donations and schools
  useEffect(() => {
    setDonations([
      {
        id: 1,
        school: "Green Valley High School",
        item: "Books",
        status: "Completed",
      },
      {
        id: 2,
        school: "Sunrise Academy",
        item: "Sanitary Towels",
        status: "Pending",
      },
    ]);

    setSchools([
      { id: 1, name: "Green Valley High School", needs: ["Books", "Desks"] },
      { id: 2, name: "Sunrise Academy", needs: ["Sanitary Towels", "Chairs"] },
    ]);
  }, []);

  // Handle navigation with profile completion check
  const handleLinkClick = (e, path) => {
    if (loading || !user) return;
    if (!user.isProfileComplete) {
      e.preventDefault();
      setShowModal(true);
      return;
    }
    navigate(path);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mt-5">
      <h2 className="text-warning">Welcome to the Donor Dashboard</h2>
      <h3 className="text-dark">{user?.name || "Donor"}</h3>
      <p className="text-dark">
        Make donations, track your contributions, and explore schools in need.
      </p>

      {/* Alerts & Notifications */}
      <Notifications notifications={notifications} />

      {/* Tabs for Navigation */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        {/* Rest of the dashboard */}
      </Tabs>

      {/* Modal for Incomplete Profile */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton className="bg-warning text-white">
          <Modal.Title>Profile Incomplete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-dark">
            Please complete your profile to access all features.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button
            variant="primary"
            as={Link}
            to="/profile"
            onClick={handleCloseModal}
          >
            Go to Profile
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DonorDashboard;
