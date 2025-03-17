import React, { useEffect, useState } from "react";
import { Table, Button, Badge, ButtonGroup } from "react-bootstrap";
import axios from "axios";

const ManageDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
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
        setLoading(false);
      } catch (error) {
        console.error("Error fetching donations:", error);
        setError("Failed to fetch donations. Please try again later.");
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  if (loading) {
    return <p>Loading donations...</p>;
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  return (
    <Table striped bordered hover>
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
              <ButtonGroup style={{ gap: "8px" }}>
                {donation.status === "Pending" && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleApprove(donation._id)}
                  >
                    Approve
                  </Button>
                )}
                {donation.status === "Approved" && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleComplete(donation._id)}
                  >
                    Complete
                  </Button>
                )}
              </ButtonGroup>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ManageDonations;
