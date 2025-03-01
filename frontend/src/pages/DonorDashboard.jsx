import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Modal,
  Button,
  Card,
  Form,
  ProgressBar,
  Tab,
  Tabs,
  Alert,
  Table,
  Row,
  Col,
} from "react-bootstrap";
import "../styles/Modal.css";
import ProfileCompletionProgress from "../components/ProfileCompletionProgress"; // Import the component

const DonorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [donations, setDonations] = useState([]);
  const [schools, setSchools] = useState([]);
  const [notifications, setNotifications] = useState([
    "Thank you for your donation to Green Valley High School.",
    "Your donation for textbooks has been accepted.",
  ]);
  const [activeTab, setActiveTab] = useState("donations");

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
      {notifications.length > 0 && (
        <Alert variant="info">
          {notifications.map((note, index) => (
            <p key={index}>{note}</p>
          ))}
        </Alert>
      )}

      {/* Tabs for Navigation */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="donations" title="Donations">
          <div className="mt-4">
            <Button
              variant="warning"
              className="text-white shadow-sm mb-4"
              onClick={(e) => handleLinkClick(e, "/make-donation")}
            >
              Make a Donation
            </Button>

            {/* Donation Summary Cards */}
            <Row className="mb-4">
              <Col md={4}>
                <Card className="shadow-sm text-center">
                  <Card.Body>
                    <Card.Title>Total Donations Made</Card.Title>
                    <h3>5</h3>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="shadow-sm text-center">
                  <Card.Body>
                    <Card.Title>Pending Donations</Card.Title>
                    <h3>2</h3>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="shadow-sm text-center">
                  <Card.Body>
                    <Card.Title>Schools Supported</Card.Title>
                    <h3>3</h3>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Recent Donations Table */}
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <Card.Title>Recent Donations</Card.Title>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>School</th>
                      <th>Item</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.length > 0 ? (
                      donations.map((donation, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{donation.school}</td>
                          <td>{donation.item}</td>
                          <td>{donation.status}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">
                          No donations yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </div>
        </Tab>
        <Tab eventKey="schools" title="Explore Schools">
          <div className="mt-4">
            <h4>Schools in Need</h4>
            <div className="d-flex flex-wrap gap-3">
              {schools.map((school) => (
                <Card
                  key={school.id}
                  className="p-3 shadow-sm"
                  style={{ width: "200px" }}
                >
                  <Card.Body>
                    <h6>{school.name}</h6>
                    <p>Needs: {school.needs.join(", ")}</p>
                    <Button variant="primary" size="sm">
                      Donate
                    </Button>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </div>
        </Tab>
        <Tab eventKey="profile" title="Manage Profile">
          <div className="mt-4">
            <h4>Donor Profile</h4>
            {/* Use ProfileCompletionProgress component */}
            <ProfileCompletionProgress user={user} />
            <p>Click the button below to update your donor profile.</p>
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
            <p>Graphs showing your donations over time (to be implemented).</p>
            <h4>Impact Summary</h4>
            <p>Summary of your contributions (to be implemented).</p>
          </div>
        </Tab>
      </Tabs>

      {/* Modal for Incomplete Profile */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Profile Incomplete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please complete your profile to access all features.</p>
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