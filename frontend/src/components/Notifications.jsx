import React, { useState } from "react";
import { Table, Alert, Button, Modal } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import axios from "axios";

const Notifications = ({ notifications, setNotifications }) => {
  const { darkMode } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const navigate = useNavigate();

  // Reverse the notifications array to show the latest first
  const reversedNotifications = [...notifications].reverse();

  const newNotificationsCount = reversedNotifications.filter(
    (note) => !note.read
  ).length;

  // Handle View Details button click
  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
  };

  // Handle Donate button click
  const handleDonate = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.isProfileComplete) {
      alert("Please complete your profile to make a donation.");
      navigate("/profile");
    } else {
      navigate("/donate");
    }
  };

  // Handle Delete Notification button click
  const handleDeleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const donorId = user.id;

      const response = await axios.delete(
        `http://localhost:5000/api/donors/${donorId}/notifications/${notificationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Remove the deleted notification from the local state
        setNotifications((prevNotifications) =>
          prevNotifications.filter((note) => note._id !== notificationId)
        );
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  return (
    <div>
      {newNotificationsCount > 0 && (
        <Alert variant="info">
          You have {newNotificationsCount} new notifications.
        </Alert>
      )}

      {reversedNotifications.length > 0 ? (
        <Table striped bordered hover>
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
            {reversedNotifications.map((note, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{note.message}</td>
                <td>{note.schoolName}</td>
                <td>{new Date(note.date).toLocaleString()}</td>
                <td>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button
                      variant="info"
                      onClick={() => handleViewDetails(note)}
                      style={{
                        backgroundColor: "#17a2b8",
                        borderColor: "#17a2b8",
                      }} // Same color for both buttons
                    >
                      View Details
                    </Button>
                    <Button
                      variant="info"
                      onClick={() => handleDeleteNotification(note._id)}
                      style={{
                        backgroundColor: "#17a2b8",
                        borderColor: "#17a2b8",
                      }} // Same color for both buttons
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
        <p>No new notifications.</p>
      )}

      {/* Modal for Notification Details */}
      {/* Modal for Notification Details */}
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
          <Modal.Title>Notification Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode ? "bg-dark" : ""}>
          {selectedNotification && (
            <>
              <p>
                <strong>Message:</strong> {selectedNotification.message}
              </p>
              <p>
                <strong>School:</strong> {selectedNotification.schoolName}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(selectedNotification.date).toLocaleString()}
              </p>
              {/* Check if the message contains "new request" or if the type is "newRequest" */}
              {(selectedNotification.type === "newRequest" ||
                (selectedNotification.message &&
                  selectedNotification.message
                    .toLowerCase()
                    .includes("new request"))) && (
                <Button
                  variant="warning"
                  style={{ backgroundColor: "#ffc107", borderColor: "#ffc107" }}
                  onClick={handleDonate}
                >
                  Donate
                </Button>
              )}
              {selectedNotification.type === "approval" && (
                <p>
                  Your donation has been approved. Please wait for completion.
                </p>
              )}
              {selectedNotification.type === "completion" && (
                <p>
                  Thank you for your donation! We will provide feedback on the
                  progress soon.
                </p>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Notifications;
