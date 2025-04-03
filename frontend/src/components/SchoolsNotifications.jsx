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
import { API_URL } from "../config";

const SchoolsNotifications = ({ notifications = [], setNotifications }) => {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

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
        `${API_URL}/api/users/${userId}/notifications/${notificationId}/read`,
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
        `${API_URL}/api/users/${userId}/notifications/read-all`,
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
        `${API_URL}/api/users/${userId}/notifications/${notificationId}`,
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
      setDeletedCount(1);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleDeleteAllNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = JSON.parse(localStorage.getItem("user"))._id;

      await axios.delete(
        `${API_URL}/api/users/${userId}/notifications`,
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

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setShowDetailsModal(true);
    if (!notification.read) {
      markAsRead(notification._id);
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
            variant="danger"
            onClick={() => setShowDeleteAllModal(true)}
            disabled={notifications.length === 0}
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
                <td 
                  style={{ 
                    color: darkMode ? "white" : "inherit",
                    cursor: "pointer"
                  }}
                  onClick={() => handleViewDetails(note)}
                >
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
                          backgroundColor: "#FFC107",
                          borderColor: "#FFC107",
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

      {/* Notification Details Modal */}
      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
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
                <strong>Status:</strong> {getStatusBadge(selectedNotification.type)}
              </p>
              <p style={{ color: darkMode ? "white" : "inherit" }}>
                <strong>Message:</strong> {selectedNotification.message}
              </p>
              <p style={{ color: darkMode ? "white" : "inherit" }}>
                <strong>Date:</strong>{" "}
                {selectedNotification.date ? formatDate(selectedNotification.date) : "No date"}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className={darkMode ? "bg-dark border-secondary" : ""}>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

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

export default SchoolsNotifications;