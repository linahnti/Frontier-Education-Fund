import React, { useState } from "react";
import { Table, Button, Badge, Alert, Modal } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

const DonationsTab = ({ donorId, donations, loading, error }) => {
  const { darkMode } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  console.log("Donations received in DonationsTab:", donations);

  const handleMakeDonation = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.isProfileComplete) {
      setShowModal(true);
    } else {
      navigate("/donate");
    }
  };

  if (loading) {
    return <p>Loading donations...</p>;
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  return (
    <div>
      <h4>Your Donations</h4>
      {donations && donations.length > 0 ? (
        <Table striped bordered hover variant={darkMode ? "dark" : undefined}>
          <thead>
            <tr>
              <th>#</th>
              <th>School Name</th>
              <th>Items/Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((donation, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{donation.schoolId?.schoolName || "N/A"}</td>
                <td>
                  {donation.type === "money"
                    ? `KES ${donation.amount}`
                    : donation.items?.join(", ") || "N/A"}
                </td>
                <td>
                  <Badge
                    bg={
                      donation.status === "Completed"
                        ? "success"
                        : donation.status === "Approved"
                        ? "primary"
                        : "warning"
                    }
                  >
                    {donation.status}
                  </Badge>
                </td>
                <td>{new Date(donation.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info">No donations found.</Alert>
      )}

      <Button variant="primary" onClick={handleMakeDonation}>
        Donate
      </Button>

      {/* Updated Modal for dark mode support */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        contentClassName={darkMode ? "bg-dark text-white" : ""}
      >
        <Modal.Header
          closeButton
          closeVariant={darkMode ? "white" : undefined}
          className={
            darkMode ? "bg-dark border-secondary" : "bg-warning text-white"
          }
        >
          <Modal.Title>Profile Incomplete</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode ? "bg-dark" : ""}>
          <p className={darkMode ? "text-white" : "text-dark"}>
            Please complete your profile to make a donation.
          </p>
        </Modal.Body>
        <Modal.Footer className={darkMode ? "bg-dark border-secondary" : ""}>
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

export default DonationsTab;
