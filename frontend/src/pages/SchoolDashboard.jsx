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
} from "react-bootstrap";
import "../styles/Modal.css";
import ProfileCompletionProgress from "../components/ProfileCompletionProgress";
import SchoolsDonationTab from "../components/SchoolsDonationTab";
import SchoolsNotifications from "../components/SchoolsNotifications";
import ReportsTab from "../components/ReportsTab";

const SchoolDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [notifications, setNotifications] = useState([]);
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

        // Ensure the user object has an `id` field
        if (!parsedUser.id) {
          throw new Error("User ID is undefined");
        }

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

        // Fetch notifications from the backend
        const notificationsResponse = await fetch(
          `http://localhost:5000/api/schools/${updatedUser.id}/notifications`, // Use updatedUser.id
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
        setNotifications(notificationsData.notifications || []); // Set notifications from backend
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
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
    <div
      style={{
        minHeight: "100vh", // Ensure the background covers the full height
        backgroundColor: "#ffffff", // White background
        padding: "20px", // Add padding for better spacing
      }}
    >
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
          Welcome to the School Dashboard
        </h2>
        <h3
          className="text-dark"
          style={{ fontSize: "2rem", fontWeight: "600" }}
        >
          {user?.name || "School"}
        </h3>
        <p className="text-dark" style={{ fontWeight: "300", opacity: "0.8" }}>
          Manage your school profile, post donation requests, and more.
        </p>

        {/* Tabs for Navigation */}
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
        >
          <Tab eventKey="donations" title="Donations">
            <SchoolsDonationTab
              schoolId={user.id}
              user={user}
              profileData={profileData}
              loading={loading}
              completionPercentage={completionPercentage}
            />
          </Tab>
          <Tab eventKey="profile" title="Manage Profile">
            <div className="mt-4">
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
          <Tab eventKey="reports" title="Reports & Analytics">
            <ReportsTab userId={user?.id} role="School" />
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
              <SchoolsNotifications notifications={notifications} />
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
    </div>
  );
};

export default SchoolDashboard;
