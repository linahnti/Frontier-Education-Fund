import React, { useEffect, useState } from "react";
import { Table, Button, Badge, ButtonGroup, Alert } from "react-bootstrap";
import axios from "axios";

const ManageDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Fetch donations from the backend
  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/admin/donations",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDonations(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching donations:", error);
      setError("Failed to fetch donations. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Show feedback for a few seconds
  const showTemporaryFeedback = (message, type = "success") => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback(null);
    }, 3000);
  };

  // Handle donation approval
  const handleApprove = async (donationId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/admin/donations/${donationId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Update the local state directly instead of relying on response
        setDonations((prevDonations) =>
          prevDonations.map((donation) =>
            donation._id === donationId
              ? { ...donation, status: "Approved" }
              : donation
          )
        );
        showTemporaryFeedback("Donation approved successfully");
      }
    } catch (error) {
      console.error("Error approving donation:", error);
      showTemporaryFeedback("Error approving donation", "danger");
    }
  };

  // Handle donation completion
  const handleComplete = async (donationId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/admin/donations/${donationId}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Update the local state directly
        setDonations((prevDonations) =>
          prevDonations.map((donation) =>
            donation._id === donationId
              ? { ...donation, status: "Completed" }
              : donation
          )
        );
        showTemporaryFeedback("Donation marked as completed");
      }
    } catch (error) {
      console.error("Error completing donation:", error);
      showTemporaryFeedback("Error completing donation", "danger");
    }
  };

  // Handle donation deletion
  const handleDelete = async (donationId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:5000/api/admin/donations/${donationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Remove the deleted donation from the local state
        setDonations((prevDonations) =>
          prevDonations.filter((donation) => donation._id !== donationId)
        );
        showTemporaryFeedback("Donation deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting donation:", error);
      showTemporaryFeedback("Error deleting donation", "danger");
    }
  };

  if (loading && donations.length === 0) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading donations...</p>
      </div>
    );
  }

  return (
    <div>
      {feedback && (
        <Alert variant={feedback.type} className="mt-3">
          {feedback.message}
        </Alert>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {donations.length === 0 ? (
        <Alert variant="info">No donations available.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Donor</th>
              <th>School</th>
              <th>Type</th>
              <th>Amount/Items</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((donation, index) => (
              <tr key={donation._id}>
                <td>{index + 1}</td>
                <td>{donation.donorId?.name || "N/A"}</td>
                <td>{donation.schoolId?.schoolName || "N/A"}</td>
                <td>{donation.type}</td>
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
                <td>
                  <ButtonGroup className="d-flex flex-wrap">
                    {donation.status === "Pending" && (
                      <Button
                        variant="success"
                        size="sm"
                        className="m-1"
                        onClick={() => handleApprove(donation._id)}
                      >
                        Approve
                      </Button>
                    )}
                    {donation.status === "Approved" && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="m-1"
                        onClick={() => handleComplete(donation._id)}
                      >
                        Complete
                      </Button>
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      className="m-1"
                      onClick={() => handleDelete(donation._id)}
                    >
                      Delete
                    </Button>
                  </ButtonGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default ManageDonations;