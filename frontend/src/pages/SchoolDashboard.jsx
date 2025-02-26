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
import ProfileCompletionProgress from "../components/ProfileCompletionProgress";

const SchoolDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [selectedNeeds, setSelectedNeeds] = useState([]);
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([
    "New donation received from John Doe.",
    "Your request for textbooks has been approved.",
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

  // Example data for donations and requests
  useEffect(() => {
    setDonations([
      { id: 1, donor: "John Doe", item: "Books", status: "Pending" },
      {
        id: 2,
        donor: "Jane Smith",
        item: "Sanitary Towels",
        status: "Accepted",
      },
      { id: 3, donor: "Alice Johnson", item: "Desks", status: "Completed" },
    ]);

    setRequests([
      {
        id: 1,
        category: "Learning Materials",
        description: "Textbooks for Grade 10",
        status: "Pending",
      },
      {
        id: 2,
        category: "Infrastructure",
        description: "New Classroom Construction",
        status: "Approved",
      },
      {
        id: 3,
        category: "Health & Hygiene",
        description: "Sanitary Towels",
        status: "Completed",
      },
    ]);
  }, []);

  // Handle navigation with profile completion check
  const handleLinkClick = (e, path) => {
    if (loading || !user) return;
    if (!user.isProfileComplete) {
      e.preventDefault();
      alert("Please complete your profile to access this feature.");
      return;
    }
    navigate(path);
  };

  // Handle donation request submission
  const handleDonationRequest = () => {
    if (selectedNeeds.length === 0) {
      alert("Please select at least one need.");
      return;
    }
    console.log("Selected Needs:", selectedNeeds);
    setShowDonationModal(false);
    setSelectedNeeds([]);
  };

  // Handle selection of needs
  const handleNeedSelection = (need) => {
    setSelectedNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    );
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mt-5">
      <h2 className="text-warning">Welcome to the School Dashboard</h2>
      <h3 className="text-dark">{user?.name || "School"}</h3>{" "}
      {/* Display user's name */}
      <p className="text-dark">
        Manage your school profile, post donation requests, and more.
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
              onClick={() => setShowDonationModal(true)}
            >
              Post a Donation Request
            </Button>

            {/* Donation Summary Cards */}
            <Row className="mb-4">
              <Col md={4}>
                <Card className="shadow-sm text-center">
                  <Card.Body>
                    <Card.Title>Total Donations Received</Card.Title>
                    <h3>10</h3>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="shadow-sm text-center">
                  <Card.Body>
                    <Card.Title>Pending Requests</Card.Title>
                    <h3>5</h3>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="shadow-sm text-center">
                  <Card.Body>
                    <Card.Title>Active Donors</Card.Title>
                    <h3>3</h3>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Recent Donation Requests Table */}
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <Card.Title>Recent Donation Requests</Card.Title>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length > 0 ? (
                      requests.map((req, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{req.category}</td>
                          <td>{req.description}</td>
                          <td>{req.status}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">
                          No requests yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </div>
        </Tab>
        <Tab eventKey="profile" title="Manage Profile">
          <div className="mt-4">
            <ProfileCompletionProgress user={user} />
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
              Graphs showing received donations over time (to be implemented).
            </p>
            <h4>Most Needed Items</h4>
            <p>List of most requested items (to be implemented).</p>
            <h4>Active Donors</h4>
            <p>List of frequent donors (to be implemented).</p>
          </div>
        </Tab>
        <Tab eventKey="messages" title="Messaging">
          <div className="mt-4">
            <h4>Message Center</h4>
            <p>Communicate with donors (to be implemented).</p>
          </div>
        </Tab>
        <Tab eventKey="announcements" title="Announcements">
          <div className="mt-4">
            <h4>Post Updates</h4>
            <Form>
              <Form.Group className="mb-3">
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Share updates or success stories"
                />
              </Form.Group>
              <Button variant="primary">Post Announcement</Button>
            </Form>
          </div>
        </Tab>
        <Tab eventKey="support" title="Support">
          <div className="mt-4">
            <h4>FAQs & Help</h4>
            <p>
              How to request donations, contact support, etc. (to be
              implemented).
            </p>
          </div>
        </Tab>
      </Tabs>
      {/* Donation Request Modal */}
      <Modal
        show={showDonationModal}
        onHide={() => setShowDonationModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Post a Donation Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Grouped Needs by Categories */}
            <h5>📚 Learning Materials</h5>
            {["Books", "Stationery", "Desks", "Chairs"].map((need) => (
              <Form.Check
                key={need}
                type="checkbox"
                label={need}
                checked={selectedNeeds.includes(need)}
                onChange={() => handleNeedSelection(need)}
              />
            ))}

            <h5 className="mt-4">🏫 Infrastructure</h5>
            {["Classrooms", "Toilets", "Water Tanks"].map((need) => (
              <Form.Check
                key={need}
                type="checkbox"
                label={need}
                checked={selectedNeeds.includes(need)}
                onChange={() => handleNeedSelection(need)}
              />
            ))}

            <h5 className="mt-4">💰 Financial Aid</h5>
            {["School Fees Support", "Sponsorships"].map((need) => (
              <Form.Check
                key={need}
                type="checkbox"
                label={need}
                checked={selectedNeeds.includes(need)}
                onChange={() => handleNeedSelection(need)}
              />
            ))}

            <h5 className="mt-4">💡 Utilities & Services</h5>
            {["Electricity", "Internet", "Security"].map((need) => (
              <Form.Check
                key={need}
                type="checkbox"
                label={need}
                checked={selectedNeeds.includes(need)}
                onChange={() => handleNeedSelection(need)}
              />
            ))}

            <h5 className="mt-4">🏥 Health & Hygiene</h5>
            {["Sanitary Towels", "First Aid Kits", "Clean Drinking Water"].map(
              (need) => (
                <Form.Check
                  key={need}
                  type="checkbox"
                  label={need}
                  checked={selectedNeeds.includes(need)}
                  onChange={() => handleNeedSelection(need)}
                />
              )
            )}

            <h5 className="mt-4">🍛 Food Supplies</h5>
            {["Lunch Programs", "Clean Water"].map((need) => (
              <Form.Check
                key={need}
                type="checkbox"
                label={need}
                checked={selectedNeeds.includes(need)}
                onChange={() => handleNeedSelection(need)}
              />
            ))}

            <Form.Group className="mt-4">
              <Form.Label>Custom Request</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Add other needs"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDonationModal(false)}
          >
            Close
          </Button>
          <Button variant="primary" onClick={handleDonationRequest}>
            Submit Request
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SchoolDashboard;