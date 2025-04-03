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
import { useTheme } from "../contexts/ThemeContext";
import ProfileCompletionProgress from "../components/ProfileCompletionProgress";
import Notifications from "../components/Notifications";
import ExploreSchools from "../components/ExploreSchools";
import DonationsTab from "../components/DonationsTab";
import ReportsTab from "../components/ReportsTab";
import DonorSupport from "../components/DonorSupport";
import { API_URL } from "../config";

const DonorDashboard = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);
  const [activeTab, setActiveTab] = useState("donations");
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [donations, setDonations] = useState([]); // State to store donations
  const [donationSubmitted, setDonationSubmitted] = useState(false); // Track new donations
  const [error, setError] = useState(null); // Define error state

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
        `${API_URL}/api/donors/${donorId}/notifications`,
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

  // Fetch donations from the backend
  const fetchDonations = async () => {
    console.log("fetchDonations function is being called");
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const donorId = user.id;

      console.log("User object:", user);
      console.log("User role:", user.role);
      console.log("User role type:", typeof user.role);
      console.log("Is role 'Donor'?", user.role === "Donor");
      console.log("Is role 'donor'?", user.role === "donor");

      // Check if the user is a donor
      if (user.role.toLowerCase() !== "donor") {
        console.log("User is not a donor. Skipping donation fetch.");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/donors/${donorId}/donations`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch donations");
      }

      const data = await response.json();
      console.log("Donations fetched from API:", data); // Log the fetched data
      if (data.length > 0) {
        setDonations(data);
      } else {
        setDonations([]);
        console.log("No donations found for this donor.");
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
      setError("Failed to fetch donations. Please try again later."); // Set error state
    }
  };

  // Fetch notifications and donations on component mount
  useEffect(() => {
    fetchNotifications();
    fetchDonations(); // Fetch donations only once on mount

    // Set up polling to fetch notifications every 10 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [donationSubmitted]); // Re-fetch donations when donationSubmitted changes

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
        minHeight: "100vh",
        backgroundColor: darkMode ? "#1a1a2e" : "#ffffff",
        color: darkMode ? "#f8f9fa" : "#212529",
        padding: "20px",
        transition: "background-color 0.3s, color 0.3s",
      }}
    >
      <div
        className="container mt-5"
        style={{
          backgroundColor: darkMode ? "#16213e" : "#f5f5f5",
          color: darkMode ? "#e9ecef" : "#212529",
          borderRadius: "10px",
          padding: "20px",
          boxShadow: darkMode
            ? "0 4px 8px rgba(0, 0, 0, 0.3)"
            : "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2
          className="text-warning"
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            color: darkMode ? "#ffc107" : "#ffc107",
          }}
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

        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
        >
          <Tab eventKey="donations" title="Donations">
            <div className="mt-4">
              <DonationsTab
                donorId={user?.id}
                donations={donations}
                loading={loading}
                error={error}
              />
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
            <ReportsTab userId={user?.id} role="Donor" />
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
              <Notifications
                notifications={notifications}
                setNotifications={setNotifications}
              />
            </div>
          </Tab>
          <Tab eventKey="support" title="Support">
            <div className="mt-4">
              <DonorSupport />
            </div>
          </Tab>
        </Tabs>

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
