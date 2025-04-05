import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Button,
  Card,
  ProgressBar,
  Tab,
  Tabs,
  Table,
  Row,
  Col,
  Modal,
  Container,
  Badge,
} from "react-bootstrap";
import "../styles/Modal.css";
import { useTheme } from "../contexts/ThemeContext";
import ProfileCompletionProgress from "../components/ProfileCompletionProgress";
import SchoolsDonationTab from "../components/SchoolsDonationTab";
import SchoolsNotifications from "../components/SchoolsNotifications";
import ReportsTab from "../components/ReportsTab";
import SupportTab from "../components/SchoolSupport";
import { API_URL } from "../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faChartLine,
  faUserEdit,
  faHandHoldingHeart,
  faEnvelope,
  faBell,
  faQuestionCircle,
  faCalendarAlt,
  faSchool,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

const SchoolDashboard = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("donations");
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [stats, setStats] = useState({
    totalDonations: 0,
    pendingRequests: 0,
    completedRequests: 0,
    totalDonors: 0,
  });
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showActiveDonorsModal, setShowActiveDonorsModal] = useState(false);
  const [activeDonors, setActiveDonors] = useState([]);

  const fetchStats = async (userId) => {
    try {
      const token = localStorage.getItem("token");

      // Fetch donations received with amounts
      const donationsRes = await fetch(
        `${API_URL}/api/schools/${userId}/donations-received`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const donationsData = await donationsRes.json();

      // Calculate total donations in KSH
      const totalDonations = donationsData.reduce((sum, donation) => {
        return sum + (donation.amount || 0);
      }, 0);

      // Fetch donation requests
      const requestsRes = await fetch(
        `${API_URL}/api/schools/${userId}/donation-requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const requestsData = await requestsRes.json();

      // Fetch active donors
      const donorsRes = await fetch(
        `${API_URL}/api/schools/${userId}/active-donors`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const donorsData = await donorsRes.json();

      setStats({
        totalDonations,
        pendingRequests: requestsData.filter((r) => r.status === "Pending")
          .length,
        completedRequests: requestsData.filter((r) => r.status === "Completed")
          .length,
        totalDonors: donorsData.activeDonors.length,
      });

      setActiveDonors(donorsData.activeDonors || []);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case "donation":
        setShowDonationModal(true);
        break;
      case "profile":
        navigate("/profile");
        break;
      case "reports":
        setActiveTab("reports");
        break;
      case "support":
        setActiveTab("support");
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!storedUser || !token) {
          throw new Error("No user found in localStorage");
        }

        const parsedUser = JSON.parse(storedUser);

        if (!parsedUser.id) {
          throw new Error("User ID is undefined");
        }

        parsedUser.role =
          parsedUser.role.charAt(0).toUpperCase() + parsedUser.role.slice(1);
        parsedUser.isProfileComplete = Boolean(parsedUser.isProfileComplete);

        const profileResponse = await fetch(`${API_URL}/api/users/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!profileResponse.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const profileData = await profileResponse.json();
        setProfileData(profileData);

        const updatedUser = { ...parsedUser, ...profileData };
        setUser(updatedUser);

        const notificationsResponse = await fetch(
          `${API_URL}/api/schools/${updatedUser.id}/notifications`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!notificationsResponse.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const notificationsData = await notificationsResponse.json();
        setNotifications(notificationsData.notifications || []);

        await fetchStats(updatedUser.id);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    const intervalId = setInterval(() => {
      const userId = JSON.parse(localStorage.getItem("user"))?.id;
      if (userId) fetchStats(userId);
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!storedUser || !token) {
        navigate("/login");
      }
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="py-5">
          <FontAwesomeIcon
            icon={faSchool}
            size="3x"
            className="text-warning mb-3"
          />
          <h3>Loading your dashboard...</h3>
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getTabIcon = (tabKey) => {
    switch (tabKey) {
      case "donations":
        return faHandHoldingHeart;
      case "profile":
        return faUserEdit;
      case "reports":
        return faChartLine;
      case "messages":
        return faEnvelope;
      case "notifications":
        return faBell;
      case "support":
        return faQuestionCircle;
      default:
        return faGraduationCap;
    }
  };

  const cardStyle = {
    backgroundColor: darkMode ? "#1e2a44" : "#ffffff",
    color: darkMode ? "#e9ecef" : "#212529",
    borderRadius: "10px",
    boxShadow: darkMode
      ? "0 4px 15px rgba(0, 0, 0, 0.3)"
      : "0 4px 15px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    border: darkMode ? "1px solid #2c3b57" : "1px solid #e9ecef",
    overflow: "hidden",
  };

  const headerStyle = {
    backgroundImage: darkMode
      ? "linear-gradient(135deg, #16213e 0%, #0f172a 100%)"
      : "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
    borderRadius: "10px 10px 0 0",
    color: darkMode ? "#ffffff" : "#212529",
    padding: "20px",
    borderBottom: darkMode ? "1px solid #2c3b57" : "1px solid #e9ecef",
  };

  const statCardStyle = {
    ...cardStyle,
    height: "100%",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: darkMode
        ? "0 6px 18px rgba(0, 0, 0, 0.4)"
        : "0 6px 18px rgba(0, 0, 0, 0.15)",
    },
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: darkMode ? "#0f172a" : "#f8f9fa",
        color: darkMode ? "#f8f9fa" : "#212529",
        padding: "20px",
        transition: "background-color 0.3s, color 0.3s",
      }}
    >
      <Container fluid className="px-4">
        {/* Dashboard Header Section */}
        {/* Dashboard Header Section */}
        {/* Dashboard Header Section */}
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
            {/* Left side - School info */}
            <Col md={8}>
              <div className="d-flex align-items-center mb-2">
                <FontAwesomeIcon
                  icon={faSchool}
                  size="2x"
                  className="me-3"
                  style={{ color: darkMode ? "#ffc107" : "#ffc107" }}
                />
                <h2
                  style={{
                    fontSize: "2.25rem",
                    fontWeight: "700",
                    margin: 0,
                    color: darkMode ? "#ffc107" : "#ffc107",
                    letterSpacing: "-0.5px",
                  }}
                >
                  School Dashboard
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
                {user?.name || "School"}
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
                Manage your school profile, donation requests, and more.
              </p>
            </Col>

            {/* Right side - Actions and profile info */}
            <Col md={4}>
              <div className="d-flex justify-content-end align-items-center gap-3">
                {/* Ask for Support Button */}
                <Button
                  variant="warning"
                  className="text-white shadow-sm"
                  onClick={() => setShowDonationModal(true)}
                  disabled={loading}
                  style={{
                    fontWeight: "600",
                    padding: "8px 16px",
                  }}
                >
                  <FontAwesomeIcon icon={faHandHoldingHeart} className="me-2" />
                  Ask for Support
                </Button>

                {/* Profile Completion Badge */}
                <div className="d-flex align-items-center">
                  <Badge
                    bg={completionPercentage === 100 ? "success" : "warning"}
                    className="py-2 px-3"
                    style={{
                      fontSize: "0.9rem",
                      backgroundColor:
                        completionPercentage === 100 ? "#198754" : "#ffc107",
                    }}
                  >
                    Profile: {completionPercentage}% Complete
                  </Badge>
                </div>
              </div>

              {/* Last login info below */}
              <div className="text-end mt-2">
                <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                  Last login: {new Date().toLocaleDateString()}
                </div>
              </div>
            </Col>
          </Row>
        </div>
        {/* Stats Cards */}
        <Row className="mb-4 g-3">
          {[
            {
              key: "totalDonations",
              title: "Total Donations",
              value: `KSH ${stats.totalDonations.toLocaleString()}`,
              icon: faHandHoldingHeart,
              color: "#ffc107",
            },
            {
              key: "pendingRequests",
              title: "Pending Requests",
              value: stats.pendingRequests,
              icon: faChartLine,
              color: "#0d6efd",
            },
            {
              key: "completedRequests",
              title: "Completed Requests",
              value: stats.completedRequests,
              icon: faGraduationCap,
              color: "#198754",
            },
            {
              key: "totalDonors",
              title: "Active Donors",
              value: stats.totalDonors,
              icon: faUsers,
              color: "#dc3545",
              onClick: () => setShowActiveDonorsModal(true),
            },
          ].map((stat) => (
            <Col sm={6} xl={3} key={stat.key}>
              <Card
                style={{
                  ...statCardStyle,
                  borderTop: `4px solid ${stat.color}`,
                  transition: "all 0.3s ease",
                  cursor: stat.onClick ? "pointer" : "default",
                }}
                className="h-100 hover-effect"
                onClick={stat.onClick}
              >
                <Card.Body className="d-flex flex-column justify-content-center text-center">
                  <div
                    className="icon-circle mb-3 mx-auto"
                    style={{
                      backgroundColor: `${stat.color}20`,
                      color: stat.color,
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FontAwesomeIcon icon={stat.icon} size="lg" />
                  </div>
                  <h2
                    style={{
                      fontWeight: "700",
                      fontSize: "2rem",
                      color: darkMode ? "#ffffff" : "#212529",
                    }}
                  >
                    {stat.value}
                  </h2>
                  <p
                    className="mb-0"
                    style={{
                      color: darkMode ? "#adb5bd" : "#6c757d",
                    }}
                  >
                    {stat.title}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Active Donors Modal */}
        <Modal
          show={showActiveDonorsModal}
          onHide={() => setShowActiveDonorsModal(false)}
          contentClassName={darkMode ? "bg-dark text-light" : ""}
          centered
          size="lg"
        >
          <Modal.Header
            closeButton
            closeVariant={darkMode ? "white" : undefined}
            className={
              darkMode
                ? "bg-dark text-light border-secondary"
                : "bg-primary text-white"
            }
          >
            <Modal.Title>Active Donors</Modal.Title>
          </Modal.Header>
          <Modal.Body className={darkMode ? "bg-dark text-light" : ""}>
            <Table
              responsive
              striped
              bordered
              hover
              variant={darkMode ? "dark" : undefined}
            >
              <thead
                className={
                  darkMode ? "bg-secondary text-light" : "bg-primary text-white"
                }
              >
                <tr>
                  <th>Donor Name</th>
                  <th>Email</th>
                  <th>Donations Made</th>
                </tr>
              </thead>
              <tbody>
                {activeDonors.length > 0 ? (
                  activeDonors.map((donor, index) => (
                    <tr key={index}>
                      <td>{donor.name}</td>
                      <td>{donor.email}</td>
                      <td>{donor.donationsMade?.length || 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center">
                      No active donors found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Modal.Body>
          <Modal.Footer className={darkMode ? "bg-dark border-secondary" : ""}>
            <Button
              variant={darkMode ? "outline-light" : "primary"}
              onClick={() => setShowActiveDonorsModal(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Main Dashboard Content */}
        <Card style={cardStyle}>
          <div style={headerStyle}>
            <h4 className="mb-0">School Management Center</h4>
          </div>
          <Card.Body className="p-0">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-0 dashboard-tabs"
              style={{
                borderBottom: darkMode
                  ? "1px solid #2c3b57"
                  : "1px solid #dee2e6",
              }}
            >
              <Tab
                eventKey="donations"
                title={
                  <span>
                    <FontAwesomeIcon
                      icon={getTabIcon("donations")}
                      className="me-2"
                    />
                    Donations
                  </span>
                }
              >
                <div className="p-4">
                  <SchoolsDonationTab
                    schoolId={user.id}
                    showDonationModal={showDonationModal}
                    setShowDonationModal={setShowDonationModal}
                    showActiveDonorsModal={showActiveDonorsModal}
                    setShowActiveDonorsModal={setShowActiveDonorsModal}
                    activeDonors={activeDonors}
                  />
                </div>
              </Tab>

              <Tab
                eventKey="profile"
                title={
                  <span>
                    <FontAwesomeIcon
                      icon={getTabIcon("profile")}
                      className="me-2"
                    />
                    Manage Profile
                  </span>
                }
              >
                <div className="p-4">
                  <ProfileCompletionProgress
                    user={user}
                    profileData={profileData}
                    setCompletionPercentage={setCompletionPercentage}
                  />
                  <Button
                    variant="primary"
                    as={Link}
                    to="/profile"
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
                    <FontAwesomeIcon
                      icon={getTabIcon("reports")}
                      className="me-2"
                    />
                    Reports & Analytics
                  </span>
                }
              >
                <div className="p-4">
                  <ReportsTab userId={user?.id} role="School" />
                </div>
              </Tab>

              <Tab
                eventKey="messages"
                title={
                  <span>
                    <FontAwesomeIcon
                      icon={getTabIcon("messages")}
                      className="me-2"
                    />
                    Messaging
                  </span>
                }
              >
                <div className="p-4">
                  <h4>Message Center</h4>
                  <p>Communicate with donors (to be implemented).</p>
                </div>
              </Tab>

              <Tab
                eventKey="notifications"
                title={
                  <span>
                    <FontAwesomeIcon
                      icon={getTabIcon("notifications")}
                      className="me-2"
                    />
                    Notifications
                    {notifications.length > 0 && (
                      <Badge bg="danger" pill className="ms-2">
                        {notifications.length}
                      </Badge>
                    )}
                  </span>
                }
              >
                <div className="p-4">
                  <SchoolsNotifications notifications={notifications} />
                </div>
              </Tab>

              <Tab
                eventKey="support"
                title={
                  <span>
                    <FontAwesomeIcon
                      icon={getTabIcon("support")}
                      className="me-2"
                    />
                    Support
                  </span>
                }
              >
                <div className="p-4">
                  <SupportTab />
                </div>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>

        {/* Quick Actions Footer */}
        <div className="mt-4 text-center">
          <Card
            style={{
              ...cardStyle,
              backgroundColor: darkMode
                ? "rgba(30, 41, 59, 0.7)"
                : "rgba(248, 249, 250, 0.7)",
            }}
          >
            <Card.Body className="py-3">
              <Row className="justify-content-center">
                <Col
                  md={8}
                  className="d-flex flex-wrap justify-content-center gap-2"
                >
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowDonationModal(true)}
                  >
                    <FontAwesomeIcon
                      icon={faHandHoldingHeart}
                      className="me-2"
                    />
                    New Donation Request
                  </Button>
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => navigate("/profile")}
                  >
                    <FontAwesomeIcon icon={faUserEdit} className="me-2" />
                    Update Profile
                  </Button>
                  <Button
                    variant="outline-info"
                    size="sm"
                    onClick={() => setActiveTab("reports")}
                  >
                    <FontAwesomeIcon icon={faChartLine} className="me-2" />
                    View Reports
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setActiveTab("support")}
                  >
                    <FontAwesomeIcon icon={faQuestionCircle} className="me-2" />
                    Help Center
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default SchoolDashboard;
