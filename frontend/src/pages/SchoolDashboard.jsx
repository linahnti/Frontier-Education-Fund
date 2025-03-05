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
import DonationRequest from "../components/DonationRequest"; // Correct import

const SchoolDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([
    "New donation received from John Doe.",
    "Your request for textbooks has been approved.",
  ]);
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
        console.log("User object refreshed:", parsedUser); // Debugging log
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
      }
    } else {
      console.error("No user found in localStorage"); // Debugging log
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

  // Show loading state while fetching user data
  if (loading) {
    return <p>Loading...</p>;
  }

  // Redirect to login if user is not found
  if (!user) {
    navigate("/login"); // Redirect to the login page
    return null; // Do not render the dashboard
  }

  return (
    <div className="container mt-5">
      <h2 className="text-warning">Welcome to the School Dashboard</h2>
      <h3 className="text-dark">{user?.name || "School"}</h3>
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
          {user ? (
            <DonationRequest
              user={user}
              loading={loading}
              completionPercentage={completionPercentage}
              setActiveTab={setActiveTab}
            />
          ) : (
            <p>Loading user data...</p>
          )}
        </Tab>
        <Tab eventKey="profile" title="Manage Profile">
          <ProfileCompletionProgress
            user={user}
            setCompletionPercentage={setCompletionPercentage}
          />
          <Button
            variant="primary"
            as={Link}
            to="/profile"
            onClick={() => navigate("/profile")}
            className="mt-3"
          >
            Go to Profile
          </Button>
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
    </div>
  );
};

export default SchoolDashboard;
