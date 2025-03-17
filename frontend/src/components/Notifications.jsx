import React, { useState } from "react";
import { Table, Alert, Button, Modal } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const Notifications = ({ notifications }) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const newNotificationsCount = notifications.filter(
    (note) => !note.read
  ).length;

  const handleDonate = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.isProfileComplete) {
      setShowModal(true); // Show modal if profile is incomplete
    } else {
      navigate("/donate"); // Navigate to the DonatePage
    }
  };

  return (
    <div>
      {newNotificationsCount > 0 && (
        <Alert variant="info">
          You have {newNotificationsCount} new notifications.
        </Alert>
      )}

      {notifications.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Message</th>
              <th>School Name</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((note, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{note.message}</td>
                <td>{note.schoolName}</td>
                <td>{new Date(note.date).toLocaleString()}</td>
                <td>
                  <Button
                    variant="warning"
                    onClick={handleDonate} // Navigate to /donate
                  >
                    Donate
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No new notifications.</p>
      )}

      {/* Modal for Incomplete Profile */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-warning text-white">
          <Modal.Title>Profile Incomplete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-dark">
            Please complete your profile to make a donation.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            as={Link}
            to="/profile"
            onClick={() => setShowModal(false)}
          >
            Go to Profile
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Notifications;