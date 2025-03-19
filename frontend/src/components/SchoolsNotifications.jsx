import React, { useState } from "react";
import { ListGroup, Badge, Button, Card } from "react-bootstrap";
import axios from "axios";

const SchoolsNotifications = ({ notifications = [] }) => {
  const [notificationsList, setNotificationsList] = useState(notifications);
  const [loading, setLoading] = useState(false);

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Function to mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const userId = JSON.parse(localStorage.getItem("user"))._id;

      const response = await axios.put(
        `http://localhost:5000/api/users/${userId}/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Update the notification in the state
        setNotificationsList((prev) =>
          prev.map((note) =>
            note._id === notificationId ? { ...note, read: true } : note
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to mark all notifications as read
  const markAllAsRead = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const userId = JSON.parse(localStorage.getItem("user"))._id;

      const response = await axios.put(
        `http://localhost:5000/api/users/${userId}/notifications/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Mark all notifications as read in the state
        setNotificationsList((prev) =>
          prev.map((note) => ({ ...note, read: true }))
        );
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get notification type badge color
  const getTypeBadgeColor = (type) => {
    const typeColors = {
      request_submission: "info",
      request_approval: "success",
      request_completion: "primary",
      request_deletion: "danger",
      approval: "success",
      completion: "primary",
      default: "secondary",
    };

    return typeColors[type] || typeColors.default;
  };

  const unreadCount = notificationsList.filter((note) => !note.read).length;

  return (
    <div className="notifications-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>
          Notifications
          {unreadCount > 0 && (
            <Badge bg="danger" className="ms-2">
              {unreadCount} new
            </Badge>
          )}
        </h4>

        {unreadCount > 0 && (
          <Button
            variant="outline-primary"
            size="sm"
            onClick={markAllAsRead}
            disabled={loading}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {notificationsList.length > 0 ? (
        <ListGroup>
          {notificationsList.map((note, index) => (
            <ListGroup.Item
              key={note._id || index}
              className={`d-flex flex-column ${
                !note.read ? "border-start border-danger border-3" : ""
              }`}
              style={{
                backgroundColor: !note.read
                  ? "rgba(255, 230, 230, 0.2)"
                  : "transparent",
              }}
            >
              <div className="d-flex justify-content-between align-items-start w-100">
                <div>
                  {note.type && (
                    <Badge bg={getTypeBadgeColor(note.type)} className="me-2">
                      {note.type.replace("_", " ")}
                    </Badge>
                  )}
                  <span>{note.message || note}</span>
                </div>
                {!note.read && (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => markAsRead(note._id)}
                    disabled={loading}
                  >
                    Mark as read
                  </Button>
                )}
              </div>
              <small className="text-muted mt-1">
                {note.date ? formatDate(note.date) : "No date"}
              </small>
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <Card className="text-center p-4">
          <Card.Body>
            <p className="mb-0">No notifications to display.</p>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default SchoolsNotifications;
