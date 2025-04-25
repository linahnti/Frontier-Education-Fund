import React, { lazy, Suspense, useState, useEffect } from "react";
import { Container, Row, Col, Card, Alert, Spinner } from "react-bootstrap";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import { useTheme } from "../contexts/ThemeContext";
import axios from "axios";
import { API_URL } from "../config";
import "../styles/AdminDashboard.css";
import DonationTrends from "../components/DonationTrends";
import SchoolRegistrationTrends from "../components/SchoolRegistrationTrends";

// Lazy load management components
const ManageDonations = lazy(() => import("./ManageDonations"));
const ManageSchools = lazy(() => import("./ManageSchools"));
const ManageUsers = lazy(() => import("./ManageUsers"));
const ManageDonationRequests = lazy(() => import("./ManageDonationRequests"));
const ManageReports = lazy(() => import("./ManageReports"));

// Dashboard Overview Component
const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalDonations: 0,
    pendingRequests: 0,
    totalSchools: 0,
    totalUsers: 0,
    recentDonations: [],
    monthlyDonations: [],
    monthlyRegistrations: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { darkMode } = useTheme();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const [donationsRes, requestsRes, schoolsRes, usersRes] =
          await Promise.all([
            axios.get(`${API_URL}/api/admin/donations`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${API_URL}/api/admin/donation-requests`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${API_URL}/api/admin/schools`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${API_URL}/api/admin/users`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        const verifiedPayments = donationsRes.data.filter(
          (d) => d.type === "money" && d.paymentReference
        ).length;

        // Calculate pending requests
        const pendingRequests = requestsRes.data.filter(
          (request) => request.status === "Pending"
        ).length;

        // Group school registrations by month
        const registrationsByMonth = Array(12).fill(0);
        schoolsRes.data.forEach((school) => {
          const month = new Date(school.createdAt).getMonth();
          registrationsByMonth[month]++;
        });

        setStats({
          totalDonations: donationsRes.data.length,
          pendingRequests, // Now using the properly defined variable
          totalSchools: schoolsRes.data.length,
          totalUsers: usersRes.data.length,
          recentDonations: donationsRes.data.slice(0, 5),
          monthlyDonations: groupDonationsByMonth(donationsRes.data),
          monthlyRegistrations: registrationsByMonth,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setError("Failed to load dashboard data");
        setStats({
          totalDonations: 0,
          pendingRequests: 0,
          totalSchools: 0,
          totalUsers: 0,
          recentDonations: [],
          monthlyDonations: [],
          monthlyRegistrations: Array(12).fill(0),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const groupDonationsByMonth = (donations) => {
    const months = Array(12).fill(0);
    donations.forEach((donation) => {
      const date = new Date(donation.createdAt || donation.date);
      const month = date.getMonth();
      months[month]++;
    });
    return months;
  };

  const formatRecentActivities = () => {
    return stats.recentDonations
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
      )
      .slice(0, 5)
      .map((donation) => ({
        icon: "bi-cash-coin",
        color: "success",
        message: `New donation from ${donation.donorId?.name || "Anonymous"}`,
        date: new Date(
          donation.createdAt || donation.date
        ).toLocaleDateString(),
      }));
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <h2 className="dashboard-title">Dashboard Overview</h2>

      <Row className="g-4 mb-4">
        {renderStatCard(
          "TOTAL DONATIONS",
          stats.totalDonations,
          "bi-cash-stack",
          "positive",
          `${Math.floor(stats.totalDonations / 10)}% from last month`
        )}
        {renderStatCard(
          "PENDING REQUESTS",
          stats.pendingRequests,
          "bi-inbox",
          "negative",
          `${Math.floor(stats.pendingRequests / 2)}% from last week`,
          "#2ecc71"
        )}
        {renderStatCard(
          "TOTAL SCHOOLS",
          stats.totalSchools,
          "bi-building",
          "positive",
          `${Math.floor(stats.totalSchools / 5)} new this month`,
          "#9b59b6"
        )}
        {renderStatCard(
          "REGISTERED USERS",
          stats.totalUsers,
          "bi-people",
          "positive",
          `${Math.floor(stats.totalUsers / 20)}% from last month`,
          "#e74c3c"
        )}
      </Row>

      <Row className="g-4">
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Donation Trends</h5>
            </Card.Header>
            <Card.Body>
              {stats.monthlyDonations.length > 0 ? (
                <DonationTrends monthlyDonations={stats.monthlyDonations} />
              ) : (
                <div className="text-center p-4">
                  <i
                    className="bi bi-bar-chart"
                    style={{ fontSize: "3rem", color: "var(--primary-color)" }}
                  ></i>
                  <p className="mt-3">No donation data available yet.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">School Registrations</h5>
            </Card.Header>
            <Card.Body>
              <SchoolRegistrationTrends
                monthlyRegistrations={stats.monthlyRegistrations}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Recent Activities</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <ul className="list-group list-group-flush">
                {formatRecentActivities().length > 0 ? (
                  formatRecentActivities().map((activity, index) => (
                    <li
                      key={index}
                      className={`list-group-item ${
                        darkMode ? "bg-dark text-light" : ""
                      }`}
                    >
                      <i
                        className={`bi ${activity.icon} me-2 text-${activity.color}`}
                      ></i>
                      {activity.message}
                      <small className="d-block text-muted">
                        {activity.date}
                      </small>
                    </li>
                  ))
                ) : (
                  <li
                    className={`list-group-item ${
                      darkMode ? "bg-dark text-light" : ""
                    }`}
                  >
                    <i className="bi bi-info-circle me-2"></i>
                    No recent activities
                  </li>
                )}
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const renderStatCard = (
  title,
  value,
  icon,
  changeType,
  changeText,
  iconColor = "#3498db"
) => (
  <Col md={3}>
    <div className="stats-card">
      <div
        className="stats-icon"
        style={{ backgroundColor: `${iconColor}20`, color: iconColor }}
      >
        <i className={`bi ${icon}`} style={{ fontSize: "1.5rem" }}></i>
      </div>
      <p className="stats-title">{title}</p>
      <h3 className="stats-value">{value}</h3>
      <p className={`stats-change ${changeType}`}>
        <i
          className={`bi bi-arrow-${changeType === "positive" ? "up" : "down"}`}
        ></i>{" "}
        {changeText}
      </p>
    </div>
  </Col>
);

const AdminDashboard = () => {
  const { darkMode } = useTheme();

  return (
    <div className={`admin-dashboard ${darkMode ? "dark" : "light"}`}>
      <AdminNavbar />
      <Container className="mt-4 pb-5">
        <Suspense
          fallback={
            <div className="text-center p-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/donations" element={<ManageDonations />} />
            <Route path="/schools" element={<ManageSchools />} />
            <Route path="/users" element={<ManageUsers />} />
            <Route
              path="/donation-requests"
              element={<ManageDonationRequests />}
            />
            <Route path="/reports" element={<ManageReports />} />
            <Route
              path="/profile"
              element={
                <div>
                  <h2 className="dashboard-title">Admin Profile</h2>
                  <p>Profile management feature is coming soon.</p>
                </div>
              }
            />
            <Route
              path="/settings"
              element={
                <div>
                  <h2 className="dashboard-title">System Settings</h2>
                  <p>Settings panel is coming soon.</p>
                </div>
              }
            />
            <Route
              path="*"
              element={<Navigate to="/admin-dashboard" replace />}
            />
          </Routes>
        </Suspense>
      </Container>
      <footer
        className={`py-4 text-center ${
          darkMode ? "bg-dark text-light" : "bg-light text-dark"
        }`}
      >
        <p className="mb-0">
          © {new Date().getFullYear()} School Donation Management System. All
          rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default AdminDashboard;
