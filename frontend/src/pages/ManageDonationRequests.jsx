import React, { useEffect, useState } from "react";
import { Table, Button, Badge, ButtonGroup, Alert } from "react-bootstrap";
import axios from "axios";

const ManageDonationRequests = () => {
  const [donationRequests, setDonationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // Add a refresh key

  // Fetch donation requests from the backend
  useEffect(() => {
    const fetchDonationRequests = async () => {
      try {
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
        setLoading(false);
      } catch (error) {
        console.error("Error fetching donation requests:", error);
        setError("Failed to fetch donation requests. Please try again later.");
        setLoading(false);
      }
    };

    fetchDonationRequests();
  }, [refreshKey]); // Add refreshKey as a dependency

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
        // Refresh the data
        setRefreshKey((prevKey) => prevKey + 1);
      }
    } catch (error) {
      console.error("Error approving donation request:", error);
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
        // Refresh the data
        setRefreshKey((prevKey) => prevKey + 1);
      }
    } catch (error) {
      console.error("Error completing donation request:", error);
    }
  };

  // Handle deletion of a donation request
  const handleDelete = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:5000/api/admin/donation-requests/${requestId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Refresh the data
        setRefreshKey((prevKey) => prevKey + 1);
      }
    } catch (error) {
      console.error("Error deleting donation request:", error);
    }
  };

  if (loading) {
    return <p>Loading donation requests...</p>;
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>#</th>
          <th>School</th>
          <th>Donation Needs</th>
          <th>Custom Request</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {donationRequests.map((request, index) => (
          <tr key={request._id}>
            <td>{index + 1}</td>
            <td>{request.schoolId?.schoolName || "N/A"}</td>
            <td>{request.donationNeeds.join(", ")}</td>
            <td>{request.customRequest || "N/A"}</td>
            <td>
              <Badge
                bg={
                  request.status === "Completed"
                    ? "success"
                    : request.status === "Approved"
                    ? "primary"
                    : "warning"
                }
              >
                {request.status}
              </Badge>
            </td>
            <td>
              <ButtonGroup style={{ gap: "8px" }}>
                {request.status === "Pending" && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleApprove(request._id)}
                  >
                    Approve
                  </Button>
                )}
                {request.status === "Approved" && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleComplete(request._id)}
                  >
                    Complete
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(request._id)}
                >
                  Delete
                </Button>
              </ButtonGroup>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ManageDonationRequests;
