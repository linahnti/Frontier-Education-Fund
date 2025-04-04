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
  Card,
  Row,
  Col,
  Form,
  InputGroup,
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faHandHoldingUsd,
  faSchool,
  faUser,
  faChartBar,
  faBell,
  faHeadset,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/DonorDashboard.css";

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
  const [donations, setDonations] = useState([]);
  const [donationSubmitted, setDonationSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [donationStats, setDonationStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    approved: 0,
  });

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
      if (data.length > 0) {
        setDonations(data);

        // Calculate donation statistics
        const total = data.length;
        const completed = data.filter(
          (donation) => donation.status === "Completed"
        ).length;
        const pending = data.filter(
          (donation) => donation.status === "Pending"
        ).length;
        const approved = data.filter(
          (donation) => donation.status === "Approved"
        ).length;

        setDonationStats({
          total,
          completed,
          pending,
          approved,
        });
      } else {
        setDonations([]);
        console.log("No donations found for this donor.");
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
      setError("Failed to fetch donations. Please try again later.");
    }
  };

  // Fetch notifications and donations on component mount
  useEffect(() => {
    fetchNotifications();
    fetchDonations();

    // Set up polling to fetch notifications every 10 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [donationSubmitted]);

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
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const cardStyles = {
    backgroundColor: darkMode ? "#2c3e50" : "#ffffff",
    color: darkMode ? "#ecf0f1" : "#333333",
    border: darkMode ? "1px solid #34495e" : "1px solid #e0e0e0",
    boxShadow: darkMode
      ? "0 4px 8px rgba(0, 0, 0, 0.3)"
      : "0 4px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "10px",
    height: "100%",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  };

  const tabHeaderStyles = {
    backgroundColor: darkMode ? "#1a1a2e" : "#f8f9fa",
    borderRadius: "10px 10px 0 0",
    border: darkMode ? "1px solid #34495e" : "1px solid #dee2e6",
    marginBottom: "0",
  };

  const tabContentStyles = {
    backgroundColor: darkMode ? "#16213e" : "#ffffff",
    borderRadius: "0 0 10px 10px",
    border: darkMode ? "1px solid #34495e" : "1px solid #dee2e6",
    borderTop: "none",
    padding: "20px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: darkMode ? "#0f172a" : "#f0f2f5",
        color: darkMode ? "#f8f9fa" : "#212529",
        padding: "20px",
        transition: "background-color 0.3s, color 0.3s",
      }}
    >
      <div
        className="container mt-4"
        style={{
          backgroundColor: darkMode ? "#1e293b" : "#ffffff",
          color: darkMode ? "#e9ecef" : "#212529",
          borderRadius: "15px",
          padding: "30px",
          boxShadow: darkMode
            ? "0 8px 16px rgba(0, 0, 0, 0.3)"
            : "0 8px 16px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          className="mb-4 p-4 rounded"
          style={{
            background: darkMode
              ? "linear-gradient(135deg, #1E293B 0%, #334155 100%)"
              : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
            boxShadow: darkMode
              ? "0 4px 12px rgba(0, 0, 0, 0.3)"
              : "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Row className="align-items-center">
            <Col md={8}>
              <div className="d-flex align-items-center mb-2">
                <FontAwesomeIcon
                  icon={faHandHoldingUsd}
                  size="2x"
                  className="me-3"
                  style={{ color: darkMode ? "#38bdf8" : "#2563eb" }}
                />
                <h2
                  style={{
                    fontSize: "2.25rem",
                    fontWeight: "700",
                    margin: 0,
                    color: darkMode ? "#38bdf8" : "#2563eb",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Donor Dashboard
                </h2>
              </div>
              <h3
                style={{
                  fontSize: "1.75rem",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                  color: darkMode ? "#ffffff" : "#212529",
                }}
              >
                {user?.name || "Donor"}
              </h3>
              <p
                style={{
                  fontWeight: "400",
                  opacity: "0.8",
                  fontSize: "1.1rem",
                  color: darkMode ? "#cbd5e1" : "#6c757d",
                  marginBottom: "0",
                }}
              >
                Make donations, track your contributions, and explore schools in
                need.
              </p>
            </Col>
            <Col md={4} className="text-end">
              <div className="d-flex flex-column align-items-end">
                <div className="mb-2">
                  <Badge
                    bg={completionPercentage === 100 ? "success" : "warning"}
                    className="py-2 px-3 mb-2"
                    style={{ fontSize: "0.9rem" }}
                  >
                    Profile: {completionPercentage}% Complete
                  </Badge>
                </div>
                <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                  <FontAwesomeIcon icon={faCalendar} className="me-1" />
                  Last login: {new Date().toLocaleDateString()}
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Updated Donation Button Section */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
          <div>{/* Any additional header content can go here */}</div>
          <div className="d-flex align-items-center">
            <Button
              variant={darkMode ? "outline-light" : "primary"}
              className="me-2"
              onClick={() => navigate("/donate")}
            >
              <FontAwesomeIcon icon={faHandHoldingUsd} className="me-2" />
              Make a Donation
            </Button>
          </div>
        </div>

        {/* Dashboard Summary Stats */}
        <Row className="mb-4">
          <Col md={3}>
            <Card style={cardStyles} className="mb-3 dashboard-stat-card">
              <Card.Body className="text-center">
                <h1
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: "bold",
                    color: darkMode ? "#38bdf8" : "#2563eb",
                  }}
                >
                  {donationStats.total}
                </h1>
                <p style={{ fontSize: "1rem", marginBottom: "0" }}>
                  Total Donations
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card
              style={{
                ...cardStyles,
                backgroundColor: darkMode ? "#2c3e50" : "#e8f5e9",
              }}
              className="mb-3 dashboard-stat-card"
            >
              <Card.Body className="text-center">
                <h1
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: "bold",
                    color: darkMode ? "#4ade80" : "#16a34a",
                  }}
                >
                  {donationStats.completed}
                </h1>
                <p style={{ fontSize: "1rem", marginBottom: "0" }}>Completed</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card
              style={{
                ...cardStyles,
                backgroundColor: darkMode ? "#2c3e50" : "#fff8e1",
              }}
              className="mb-3 dashboard-stat-card"
            >
              <Card.Body className="text-center">
                <h1
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: "bold",
                    color: darkMode ? "#facc15" : "#ca8a04",
                  }}
                >
                  {donationStats.pending}
                </h1>
                <p style={{ fontSize: "1rem", marginBottom: "0" }}>Pending</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card
              style={{
                ...cardStyles,
                backgroundColor: darkMode ? "#2c3e50" : "#e3f2fd",
              }}
              className="mb-3 dashboard-stat-card"
            >
              <Card.Body className="text-center">
                <h1
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: "bold",
                    color: darkMode ? "#60a5fa" : "#2563eb",
                  }}
                >
                  {donationStats.approved}
                </h1>
                <p style={{ fontSize: "1rem", marginBottom: "0" }}>Approved</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4 dashboard-tabs"
          style={tabHeaderStyles}
        >
          <Tab
            eventKey="donations"
            title={
              <span>
                <FontAwesomeIcon icon={faHandHoldingUsd} className="me-2" />
                Donations
              </span>
            }
          >
            <div className="mt-0" style={tabContentStyles}>
              <DonationsTab
                donorId={user?.id}
                donations={donations}
                loading={loading}
                error={error}
              />
            </div>
          </Tab>
          <Tab
            eventKey="schools"
            title={
              <span>
                <FontAwesomeIcon icon={faSchool} className="me-2" />
                Explore Schools
              </span>
            }
          >
            <div className="mt-0" style={tabContentStyles}>
              <ExploreSchools />
            </div>
          </Tab>
          <Tab
            eventKey="profile"
            title={
              <span>
                <FontAwesomeIcon icon={faUser} className="me-2" />
                Manage Profile
              </span>
            }
          >
            <div className="mt-0" style={tabContentStyles}>
              <ProfileCompletionProgress
                user={user}
                setCompletionPercentage={setCompletionPercentage}
              />
              <Button
                variant={darkMode ? "outline-light" : "primary"}
                as={Link}
                to="/profile"
                onClick={() => navigate("/profile")}
                className="mt-3"
              >
                Go to Profile
              </Button>
            </div>
          </Tab>
          <Tab
            eventKey="reports"
            title={
              <span>
                <FontAwesomeIcon icon={faChartBar} className="me-2" />
                Reports & Analytics
              </span>
            }
          >
            <div className="mt-0" style={tabContentStyles}>
              <ReportsTab userId={user?.id} role="Donor" />
            </div>
          </Tab>
          <Tab
            eventKey="notifications"
            title={
              <span>
                <FontAwesomeIcon icon={faBell} className="me-2" />
                Notifications{" "}
                {newNotificationsCount > 0 && (
                  <Badge bg="danger" pill>
                    {newNotificationsCount}
                  </Badge>
                )}
              </span>
            }
          >
            <div className="mt-0" style={tabContentStyles}>
              <Notifications
                notifications={notifications}
                setNotifications={setNotifications}
              />
            </div>
          </Tab>
          <Tab
            eventKey="support"
            title={
              <span>
                <FontAwesomeIcon icon={faHeadset} className="me-2" />
                Support
              </span>
            }
          >
            <div className="mt-0" style={tabContentStyles}>
              <DonorSupport />
            </div>
          </Tab>
        </Tabs>

        <Modal
          show={showModal}
          onHide={handleCloseModal}
          centered
          className={darkMode ? "dark-modal" : ""}
        >
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
