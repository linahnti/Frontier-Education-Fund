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
import axios from "axios";
import { FiSearch } from "react-icons/fi";
import { useTheme } from "../contexts/ThemeContext";
import "../styles/Notifications.css";

const SchoolsNotifications = ({ notifications = [], setNotifications }) => {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  // Filter and reverse notifications
  const filteredNotifications = notifications
    .filter((note) => {
      const messageMatch =
        note.message?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const typeMatch =
        note.type?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      return messageMatch || typeMatch;
    })
    .reverse();

  const unreadCount = notifications.filter((note) => !note.read).length;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadge = (type) => {
    switch (type) {
      case "approval":
      case "request_approval":
        return <Badge bg="success">Approved</Badge>;
      case "completion":
      case "request_completion":
        return <Badge bg="primary">Completed</Badge>;
      case "rejection":
      case "request_rejection":
        return <Badge bg="danger">Rejected</Badge>;
      case "request_submission":
        return <Badge bg="info">Submitted</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const userId = JSON.parse(localStorage.getItem("user"))._id;

      await axios.put(
        `http://localhost:5000/api/users/${userId}/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((note) =>
          note._id === notificationId ? { ...note, read: true } : note
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const userId = JSON.parse(localStorage.getItem("user"))._id;

      await axios.put(
        `http://localhost:5000/api/users/${userId}/notifications/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) => prev.map((note) => ({ ...note, read: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      const userId = JSON.parse(localStorage.getItem("user"))._id;

      await axios.delete(
        `http://localhost:5000/api/users/${userId}/notifications/${notificationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.filter((note) => note._id !== notificationId)
      );
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleDeleteAllNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = JSON.parse(localStorage.getItem("user"))._id;

      await axios.delete(
        `http://localhost:5000/api/users/${userId}/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications([]);
      setShowDeleteAllModal(false);
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    }
  };

  return (
    <div
      className={`p-4 ${darkMode ? "bg-dark text-white" : "bg-light"}`}
      style={{ borderRadius: "10px" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2
          className="mb-0"
          style={{ color: darkMode ? "#FFC107" : "#0d6efd" }}
        >
          Notifications
          {unreadCount > 0 && (
            <Badge bg="warning" text="dark" className="ms-2">
              {unreadCount} new
            </Badge>
          )}
        </h2>
        <div>
          <Button
            variant="warning"
            onClick={markAllAsRead}
            className="me-2"
            disabled={loading || unreadCount === 0}
            style={{ backgroundColor: "#FFC107", borderColor: "#FFC107" }}
          >
            Mark All as Read
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowDeleteAllModal(true)}
            disabled={notifications.length === 0}
            style={{ backgroundColor: "#0d6efd", borderColor: "#0d6efd" }}
          >
            Delete All
          </Button>
        </div>
      </div>

      <InputGroup className="mb-4">
        <Form.Control
          placeholder="Search notifications by message, status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={darkMode ? "search-bar-dark" : "search-bar-light"}
          style={{
            borderRight: "none",
            caretColor: "#FFC107", // Yellow cursor in both modes
            color: darkMode ? "#ffffff" : "#000000", // White text in dark mode, black in light mode
            backgroundColor: darkMode ? "#333" : "#fff", // Ensure dark background in dark mode
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
          //onClick={() => {}} // Add search functionality if needed
        >
          <FiSearch style={{ color: darkMode ? "#ffffff" : "#495057" }} />
        </Button>
      </InputGroup>

      {/* {unreadCount > 0 && (
        <Alert variant="info" className="mb-4">
          You have {unreadCount} new notifications.
        </Alert>
      )} */}

      {filteredNotifications.length > 0 ? (
        <Table striped bordered hover variant={darkMode ? "dark" : "light"}>
          <thead>
            <tr>
              <th>#</th>
              <th>Status</th>
              <th>Message</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotifications.map((note, index) => (
              <tr key={index} style={{ fontWeight: "normal" }}>
                <td>{index + 1}</td>
                <td>{getStatusBadge(note.type)}</td>
                <td style={{ color: darkMode ? "white" : "inherit" }}>
                  {note.message}
                </td>
                <td style={{ color: darkMode ? "white" : "inherit" }}>
                  {note.date ? formatDate(note.date) : "No date"}
                </td>
                <td>
                  <div className="d-flex gap-2">
                    {!note.read && (
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => markAsRead(note._id)}
                        disabled={loading}
                        style={{
                          backgroundColor: "#0d6efd",
                          borderColor: "#0d6efd",
                        }}
                      >
                        Mark as read
                      </Button>
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setNotificationToDelete(note._id);
                        setShowDeleteModal(true);
                      }}
                      disabled={loading}
                      style={{
                        backgroundColor: "#0d6efd",
                        borderColor: "#0d6efd",
                      }}
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
          No notifications to display.
        </Alert>
      )}

      {/* Delete Single Notification Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
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
          Are you sure you want to delete this notification? This action cannot
          be undone.
        </Modal.Body>
        <Modal.Footer className={darkMode ? "bg-dark border-secondary" : ""}>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDeleteNotification(notificationToDelete)}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete All Notifications Modal */}
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
    </div>
  );
};

export default SchoolsNotifications;
