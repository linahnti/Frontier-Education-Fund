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
import DonationRequest from "../components/DonationRequest";

const SchoolDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [notifications, setNotifications] = useState([
    "New donation received from John Doe.",
    "Your request for textbooks has been approved.",
  ]);
  const [activeTab, setActiveTab] = useState("donations");
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Fetch user data from localStorage and API on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!storedUser || !token) {
          throw new Error("No user found in localStorage");
        }

        const parsedUser = JSON.parse(storedUser);

        // Capitalize the role for consistency
        parsedUser.role =
          parsedUser.role.charAt(0).toUpperCase() + parsedUser.role.slice(1);
        parsedUser.isProfileComplete = Boolean(parsedUser.isProfileComplete);

        // Fetch the complete user profile from the backend
        const profileResponse = await fetch(
          `http://localhost:5000/api/users/profile`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!profileResponse.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const profileData = await profileResponse.json();
        setProfileData(profileData);
        console.log("Fetched profile data:", profileData);

        // Merge the stored user with the profile data
        const updatedUser = { ...parsedUser, ...profileData };
        setUser(updatedUser);
        console.log("User data successfully loaded:", updatedUser);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Redirect to login if no user is found after loading completes
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  // Show loading state while fetching user data
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h3>Loading your dashboard...</h3>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Do not render the dashboard if the user is not found
  if (!user) {
    return null;
  }

  return (
    <div className="container mt-5">
      <h2 className="text-warning">Welcome to the School Dashboard</h2>
      <h3 className="text-dark">{user?.name || "School"}</h3>
      <p className="text-dark">
        Manage your school profile, post donation requests, and more.
      </p>

      {/* Tabs for Navigation */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="donations" title="Donations">
          <DonationRequest
            user={user}
            loading={loading}
            completionPercentage={completionPercentage}
            profileData={profileData}
          />
        </Tab>
        <Tab eventKey="profile" title="Manage Profile">
          <div className="mt-4">
            <ProfileCompletionProgress
              user={user}
              profileData={profileData}
              setCompletionPercentage={setCompletionPercentage}
            />
            <Button variant="primary" as={Link} to="/profile" className="mt-3">
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
        {/* Notifications Tab */}
        <Tab eventKey="notifications" title="Notifications">
          <div className="mt-4">
            <h4>Notifications</h4>
            {notifications.length > 0 ? (
              <ul className="list-group">
                {notifications.map((note, index) => (
                  <li key={index} className="list-group-item">
                    {note}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No notifications to display.</p>
            )}
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