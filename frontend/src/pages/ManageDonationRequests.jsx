import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Badge,
  ButtonGroup,
  Alert,
  Modal,
} from "react-bootstrap";
import axios from "axios";

const ManageDonationRequests = () => {
  const [donationRequests, setDonationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);

  // Fetch donation requests from the backend
  useEffect(() => {
    fetchDonationRequests();
  }, []);

  const fetchDonationRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/admin/donation-requests",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDonationRequests(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching donation requests:", error);
      setError("Failed to fetch donation requests. Please try again later.");
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

  // Handle approval of a donation request
  const handleApprove = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/admin/donation-requests/${requestId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        showTemporaryFeedback("Donation request approved successfully");
        // Update the state directly instead of refetching all data
        setDonationRequests(prevRequests => 
          prevRequests.map(request => 
            request._id === requestId 
              ? {...request, status: "Approved"} 
              : request
          )
        );
      }
    } catch (error) {
      console.error("Error approving donation request:", error);
      showTemporaryFeedback("Error approving donation request", "danger");
    }
  };

  // Handle rejection of a donation request
  const handleReject = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/admin/donation-requests/${requestId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        showTemporaryFeedback("Donation request rejected successfully");
        // Update the state directly instead of refetching all data
        setDonationRequests(prevRequests => 
          prevRequests.map(request => 
            request._id === requestId 
              ? {...request, status: "Rejected"} 
              : request
          )
        );
      }
    } catch (error) {
      console.error("Error rejecting donation request:", error);
      showTemporaryFeedback("Error rejecting donation request", "danger");
    }
  };

  // Handle completion of a donation request
  const handleComplete = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/admin/donation-requests/${requestId}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        showTemporaryFeedback("Donation request marked as completed");
        // Update the state directly instead of refetching all data
        setDonationRequests(prevRequests => 
          prevRequests.map(request => 
            request._id === requestId 
              ? {...request, status: "Completed"} 
              : request
          )
        );
      }
    } catch (error) {
      console.error("Error completing donation request:", error);
      showTemporaryFeedback("Error completing donation request", "danger");
    }
  };

  // Confirm deletion of a donation request
  const confirmDelete = (requestId) => {
    setRequestToDelete(requestId);
    setShowModal(true);
  };

  // Handle deletion of a donation request
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:5000/api/admin/donation-requests/${requestToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        showTemporaryFeedback("Donation request deleted successfully");
        // Filter out the deleted request instead of refetching all data
        setDonationRequests(prevRequests => 
          prevRequests.filter(request => request._id !== requestToDelete)
        );
      }
      setShowModal(false);
    } catch (error) {
      console.error("Error deleting donation request:", error);
      showTemporaryFeedback("Error deleting donation request", "danger");
    }
  };

  // Get status badge based on request status
  const getStatusBadge = (status) => {
    let badgeColor = "warning";
    if (status === "Approved") badgeColor = "primary";
    if (status === "Completed") badgeColor = "success";
    if (status === "Rejected") badgeColor = "danger";

    return <Badge bg={badgeColor}>{status}</Badge>;
  };

  if (loading && donationRequests.length === 0) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading donation requests...</p>
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

      {donationRequests.length === 0 ? (
        <Alert variant="info">No donation requests available.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>School</th>
              <th>Location</th>
              <th>Donation Needs</th>
              <th>Custom Request</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {donationRequests.map((request, index) => (
              <tr key={request._id}>
                <td>{index + 1}</td>
                <td>{request.schoolId?.schoolName || "N/A"}</td>
                <td>{request.schoolId?.location || "N/A"}</td>
                <td>{request.donationNeeds.join(", ")}</td>
                <td>{request.customRequest || "N/A"}</td>
                <td>{getStatusBadge(request.status)}</td>
                <td>
                  {new Date(
                    request.createdAt || request.date
                  ).toLocaleDateString()}
                </td>
                <td>
                  <ButtonGroup className="d-flex flex-wrap">
                    {request.status === "Pending" && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          className="m-1"
                          onClick={() => handleApprove(request._id)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="m-1"
                          onClick={() => handleReject(request._id)}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {request.status === "Approved" && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="m-1"
                        onClick={() => handleComplete(request._id)}
                      >
                        Complete
                      </Button>
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      className="m-1"
                      onClick={() => confirmDelete(request._id)}
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

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this donation request? This action
          cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageDonationRequests;