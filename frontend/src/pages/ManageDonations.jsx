import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Badge,
  ButtonGroup,
  Alert,
  Form,
  Dropdown,
  InputGroup,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../config";
import SearchInput from "../components/SearchInput";

const ManageDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  // Fetch donations from the backend
  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/admin/donations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const donationsArray = Array.isArray(response.data) ? response.data : [];
      setDonations(donationsArray);
      setError(null);
    } catch (error) {
      console.error("Error fetching donations:", error);
      setError("Failed to fetch donations. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = donations.filter((donation) => {
    const matchesSearch =
      donation.donorId?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      donation.schoolId?.schoolName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || donation.status === statusFilter;
    const matchesType =
      typeFilter === "All" || donation.type === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

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
        `${API_URL}/api/admin/donations/${donationId}/approve`,
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
        `${API_URL}/api/admin/donations/${donationId}/complete`,
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
        `${API_URL}/api/admin/donations/${donationId}`,
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

      <div className="search-filter-container mb-4">
        <Row className="g-3">
          <Col md={6}>
            <SearchInput
              placeholder="Search by donor or school"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Dropdown>
              <Dropdown.Toggle
                variant="outline-secondary"
                id="dropdown-status-filter"
              >
                Status: {statusFilter}
              </Dropdown.Toggle>
              <Dropdown.Menu className="filter-dropdown">
                <Dropdown.Item onClick={() => setStatusFilter("All")}>
                  All
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setStatusFilter("Pending")}>
                  Pending
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setStatusFilter("Approved")}>
                  Approved
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setStatusFilter("Completed")}>
                  Completed
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
          <Col md={3}>
            <Dropdown>
              <Dropdown.Toggle
                variant="outline-secondary"
                id="dropdown-type-filter"
              >
                Type: {typeFilter}
              </Dropdown.Toggle>
              <Dropdown.Menu className="filter-dropdown">
                <Dropdown.Item onClick={() => setTypeFilter("All")}>
                  All
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setTypeFilter("Money")}>
                  Money
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setTypeFilter("Items")}>
                  Items
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>
      </div>

      {filteredDonations.length === 0 ? (
        <Alert variant="info">No donations match your criteria.</Alert>
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
