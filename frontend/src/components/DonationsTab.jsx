import React, { useState } from "react"; // Import useState
import { Table, Button, Badge, Alert, Modal } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";

const DonationsTab = ({ donorId, donations, loading, error }) => {
  const [showModal, setShowModal] = useState(false); // Now useState is defined
  const navigate = useNavigate();

  // Handle "Make a Donation" button click
  const handleMakeDonation = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.isProfileComplete) {
      setShowModal(true); // Show modal if profile is incomplete
    } else {
      navigate("/donate"); // Redirect to the donation page
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
      {donations.length > 0 ? (
        <Table striped bordered hover>
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

export default DonationsTab;