import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Modal,
  Button,
  ProgressBar,
  Tab,
  Tabs,
  Alert,
  Badge,
} from "react-bootstrap";
import "../styles/Modal.css";
import ProfileCompletionProgress from "../components/ProfileCompletionProgress";
import Notifications from "../components/Notifications";
import ExploreSchools from "../components/ExploreSchools";
import DonationsTab from "../components/DonationsTab";

const DonorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);
  const [activeTab, setActiveTab] = useState("donations");
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Fetch user data from localStorage on component mount
  useEffect(() => {
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
    setLoading(false);
  }, []);

  // Fetch notifications from the backend
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const donorId = user.id;

      const response = await fetch(
        `http://localhost:5000/api/donors/${donorId}/notifications`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(data.notifications);

      // Calculate the number of new notifications (unread)
      const newNotifications = data.notifications.filter((note) => !note.read);
      setNewNotificationsCount(newNotifications.length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
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
    <div
      style={{
        minHeight: "100vh", // Ensure the background covers the full height
        backgroundColor: "#ffffff", // White background
        padding: "20px", // Add padding for better spacing
      }}
    >
      {/* Dashboard Content */}
      <div
        className="container mt-5"
        style={{
          backgroundColor: "#f5f5f5", // Light grey container
          borderRadius: "10px", // Optional: Add rounded corners
          padding: "20px", // Add padding for better spacing
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Floating effect
        }}
      >
        {/* Dashboard Title and User Name */}
        <h2
          className="text-warning"
          style={{ fontSize: "2.5rem", fontWeight: "bold" }}
        >
          Welcome to the Donor Dashboard
        </h2>
        <h3
          className="text-dark"
          style={{ fontSize: "2rem", fontWeight: "600" }}
        >
          {user?.name || "Donor"}
        </h3>
        <p className="text-dark" style={{ fontWeight: "300", opacity: "0.8" }}>
          Make donations, track your contributions, and explore schools in need.
        </p>

        {/* Tabs for Navigation */}
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
        >
          <Tab eventKey="donations" title="Donations">
            <div className="mt-4">
              <DonationsTab donorId={user?.id} />
            </div>
          </Tab>
          <Tab eventKey="schools" title="Explore Schools">
            <div className="mt-4">
              <ExploreSchools />
            </div>
          </Tab>
          <Tab eventKey="profile" title="Manage Profile">
            <div className="mt-4">
              <ProfileCompletionProgress
                user={user}
                setCompletionPercentage={setCompletionPercentage}
              />
              <Button
                variant="primary"
                as={Link}
                to="/profile"
                onClick={() => navigate("/profile")}
              >
                Go to Profile
              </Button>
            </div>
          </Tab>
          <Tab eventKey="reports" title="Reports & Analytics">
            <div className="mt-4">
              <h4>Donation Trends</h4>
              <p>
                Graphs showing your donations over time (to be implemented).
              </p>
              <h4>Impact Summary</h4>
              <p>Summary of your contributions (to be implemented).</p>
            </div>
          </Tab>
          <Tab
            eventKey="notifications"
            title={
              <>
                Notifications{" "}
                {newNotificationsCount > 0 && (
                  <Badge bg="warning" text="dark">
                    {newNotificationsCount}
                  </Badge>
                )}
              </>
            }
          >
            <div className="mt-4">
              <Notifications notifications={notifications} />
            </div>
          </Tab>
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
    </div>
  );
};

export default DonorDashboard;
