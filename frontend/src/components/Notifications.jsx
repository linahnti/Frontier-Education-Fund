import React, { useState } from "react";
import {
  Table,
  Alert,
  Button,
  Modal,
  Form,
  InputGroup,
  Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import axios from "axios";
import { FiSearch } from "react-icons/fi";
import "../styles/Notifications.css";

const Notifications = ({ notifications = [], setNotifications }) => {
  const { darkMode } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);
  const navigate = useNavigate();

  // Filter and reverse notifications
  const filteredNotifications = notifications
    .filter((note) => {
      const messageMatch =
        note.message?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const schoolMatch =
        note.schoolName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false;
      return messageMatch || schoolMatch;
    })
    .reverse();

  const newNotificationsCount = notifications.filter(
    (note) => !note.read
  ).length;

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
    markAsRead(notification._id);
  };

  const handleDonate = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.isProfileComplete) {
      alert("Please complete your profile to make a donation.");
      navigate("/profile");
    } else {
      navigate("/donate");
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const donorId = user.id;

      await axios.put(
        `http://localhost:5000/api/donors/${donorId}/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prevNotifications) =>
        prevNotifications.map((note) =>
          note._id === notificationId ? { ...note, read: true } : note
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const donorId = user.id;

      await axios.put(
        `http://localhost:5000/api/donors/${donorId}/notifications/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prevNotifications) =>
        prevNotifications.map((note) => ({ ...note, read: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const donorId = user.id;

      await axios.delete(
        `http://localhost:5000/api/donors/${donorId}/notifications/${notificationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prevNotifications) =>
        prevNotifications.filter((note) => note._id !== notificationId)
      );

      setDeletedCount(1);
      setShowSuccessModal(true);
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleDeleteAllNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const donorId = user.id;

      await axios.delete(
        `http://localhost:5000/api/donors/${donorId}/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const countBeforeDelete = notifications.length;
      setNotifications([]);
      setShowDeleteAllModal(false);
      setDeletedCount(countBeforeDelete);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const donorId = user.id;

      const response = await axios.get(
        `http://localhost:5000/api/donors/${donorId}/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  return (
    <div
      className={`p-4 ${darkMode ? "bg-dark text-white" : "bg-white"}`}
      style={{ borderRadius: "10px" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2
          className="mb-0"
          style={{ color: darkMode ? "#FFC107" : "#0d6efd" }}
        >
          Notifications
          {newNotificationsCount > 0 && (
            <Badge bg="warning" text="dark" className="ms-2">
              {newNotificationsCount} new
            </Badge>
          )}
        </h2>
        <div>
          <Button
            variant="warning"
            onClick={markAllAsRead}
            className="me-2"
            style={{ backgroundColor: "#FFC107", borderColor: "#FFC107" }}
          >
            Mark All as Read
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteAllModal(true)}>
            Delete All
          </Button>
        </div>
      </div>

      <InputGroup className="mb-4">
        <Form.Control
          placeholder="Search notifications by message, school..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={darkMode ? "search-bar-dark" : "search-bar-light"}
          style={{
            borderRight: "none",
            caretColor: "#FFC107",
            color: darkMode ? "#ffffff" : "#000000",
            backgroundColor: darkMode ? "#333" : "#fff",
          }}
        />
        <Button
          variant={darkMode ? "outline-warning" : "outline-primary"}
          style={{
            backgroundColor: darkMode
              ? "rgba(255, 193, 7, 0.1)"
              : "transparent",
            borderLeft: "none",
          }}
        >
          <FiSearch style={{ color: darkMode ? "#ffffff" : "#495057" }} />
        </Button>
      </InputGroup>

      {filteredNotifications.length > 0 ? (
        <Table striped bordered hover variant={darkMode ? "dark" : "light"}>
          <thead>
            <tr>
              <th>#</th>
              <th>Message</th>
              <th>School Name</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotifications.map((note, index) => (
              <tr key={index} style={{ fontWeight: "normal" }}>
                <td>{index + 1}</td>
                <td style={{ color: darkMode ? "white" : "inherit" }}>
                  {note.message}
                </td>
                <td style={{ color: darkMode ? "white" : "inherit" }}>
                  {note.schoolName || "N/A"}
                </td>
                <td style={{ color: darkMode ? "white" : "inherit" }}>
                  {new Date(note.date).toLocaleString()}
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      onClick={() => handleViewDetails(note)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteNotification(note._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="secondary" className="text-center py-4">
          No notifications found.
        </Alert>
      )}

      {/* Notification Details Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        contentClassName={darkMode ? "bg-dark text-white" : ""}
      >
        <Modal.Header
          closeButton
          closeVariant={darkMode ? "white" : undefined}
          className={darkMode ? "bg-dark border-secondary" : ""}
        >
          <Modal.Title style={{ color: "#FFC107" }}>
            Notification Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode ? "bg-dark" : ""}>
          {selectedNotification && (
            <>
              <p style={{ color: darkMode ? "white" : "inherit" }}>
                <strong>Message:</strong> {selectedNotification.message}
              </p>
              <p style={{ color: darkMode ? "white" : "inherit" }}>
                <strong>School:</strong>{" "}
                {selectedNotification.schoolName || "N/A"}
              </p>
              <p style={{ color: darkMode ? "white" : "inherit" }}>
                <strong>Date:</strong>{" "}
                {new Date(selectedNotification.date).toLocaleString()}
              </p>
              {(selectedNotification.type === "newRequest" ||
                (selectedNotification.message &&
                  selectedNotification.message
                    .toLowerCase()
                    .includes("new request"))) && (
                <Button
                  variant="warning"
                  style={{ backgroundColor: "#FFC107", borderColor: "#FFC107" }}
                  onClick={handleDonate}
                >
                  Donate
                </Button>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer className={darkMode ? "bg-dark border-secondary" : ""}>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete All Confirmation Modal */}
      <Modal
        show={showDeleteAllModal}
        onHide={() => setShowDeleteAllModal(false)}
        centered
        contentClassName={darkMode ? "bg-dark text-white" : ""}
      >
        <Modal.Header
          closeButton
          closeVariant={darkMode ? "white" : undefined}
          className={darkMode ? "bg-dark border-secondary" : ""}
        >
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode ? "bg-dark" : ""}>
          Are you sure you want to delete all notifications? This action cannot
          be undone.
        </Modal.Body>
        <Modal.Footer className={darkMode ? "bg-dark border-secondary" : ""}>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteAllModal(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAllNotifications}>
            Delete All
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Success Deletion Modal */}
      <Modal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        centered
        contentClassName={darkMode ? "bg-dark text-white" : ""}
      >
        <Modal.Header
          closeButton
          closeVariant={darkMode ? "white" : undefined}
          className={darkMode ? "bg-dark border-secondary" : ""}
        >
          <Modal.Title style={{ color: "#28a745" }}>Success</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode ? "bg-dark" : ""}>
          Successfully deleted {deletedCount} notification
          {deletedCount > 1 ? "s" : ""}!
        </Modal.Body>
        <Modal.Footer className={darkMode ? "bg-dark border-secondary" : ""}>
          <Button variant="success" onClick={() => setShowSuccessModal(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Notifications;
