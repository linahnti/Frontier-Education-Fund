import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Row,
  Col,
  Modal,
  Button,
  Pagination,
  Badge,
} from "react-bootstrap";
import axios from "axios";
import DonationRequest from "./DonationRequest";
import { useTheme } from "../contexts/ThemeContext";
import { API_URL } from "../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faHandHoldingHeart,
  faMoneyBillWave,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";

const SchoolsDonationTab = ({
  schoolId,
  showDonationModal,
  setShowDonationModal,
  showActiveDonorsModal,
  setShowActiveDonorsModal,
  activeDonors,
}) => {
  const { darkMode } = useTheme();
  const [donationsReceived, setDonationsReceived] = useState([]);
  const [donationRequests, setDonationRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [donationsCurrentPage, setDonationsCurrentPage] = useState(1);
  const [requestsCurrentPage, setRequestsCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!schoolId) {
        console.error("School ID is undefined");
        return;
      }

      const [donationsResponse, requestsResponse] = await Promise.all([
        axios.get(`${API_URL}/api/schools/${schoolId}/donations-received`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/schools/${schoolId}/donation-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Process donations to ensure proper display
      const processedDonations = donationsResponse.data.map((donation) => ({
        ...donation,
        donorName: donation.donorId?.name || "Anonymous Donor",
        displayValue:
          donation.type === "money"
            ? `KES ${donation.amount || 0}`
            : donation.items?.join(", ") || "N/A", // Changed from "Items donation" to "N/A"
        status: donation.status || "Pending",
        date: donation.date || new Date(),
      }));

      setDonationsReceived(processedDonations);
      setDonationRequests(requestsResponse.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDonations = () => {
    return donationsReceived.filter((donation) => {
      const statusMatch =
        filterStatus === "All" || donation.status === filterStatus;
      const searchTermLower = searchTerm.toLowerCase();
      const searchMatch =
        searchTerm === "" ||
        donation.donorName?.toLowerCase().includes(searchTermLower) ||
        (donation.type === "money"
          ? `KES ${donation.amount}`.toLowerCase().includes(searchTermLower)
          : donation.items
              ?.join(", ")
              .toLowerCase()
              .includes(searchTermLower)) ||
        donation.status?.toLowerCase().includes(searchTermLower) ||
        (donation.date &&
          new Date(donation.date).toLocaleDateString().includes(searchTerm));

      return statusMatch && searchMatch;
    });
  };

  const getFilteredRequests = () => {
    return donationRequests.filter((request) => {
      const statusMatch =
        filterStatus === "All" || request.status === filterStatus;
      const searchMatch =
        searchTerm === "" ||
        request.donationNeeds?.some((need) =>
          need.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        request.customRequest
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        request.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.date &&
          new Date(request.date).toLocaleDateString().includes(searchTerm));

      return statusMatch && searchMatch;
    });
  };

  // Calculate total donation amount and count
  const { totalAmount, moneyCount, itemCount } = donationsReceived.reduce(
    (stats, donation) => {
      if (donation.type === "money") {
        stats.totalAmount += donation.amount || 0;
        stats.moneyCount += 1;
      } else {
        stats.itemCount += 1;
      }
      return stats;
    },
    { totalAmount: 0, moneyCount: 0, itemCount: 0 }
  );

  const paginate = (items, currentPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };

  const filteredDonations = getFilteredDonations();
  const filteredRequests = getFilteredRequests();

  const paginatedDonations = paginate(filteredDonations, donationsCurrentPage);
  const paginatedRequests = paginate(filteredRequests, requestsCurrentPage);

  const donationsTotalPages = Math.ceil(
    filteredDonations.length / itemsPerPage
  );
  const requestsTotalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, [schoolId]);

  const cardStyle = darkMode
    ? {
        backgroundColor: "#1e2a44",
        color: "#e9ecef",
        borderRadius: "10px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
        border: "1px solid #2c3b57",
        height: "100%",
      }
    : {
        backgroundColor: "#ffffff",
        color: "#212529",
        borderRadius: "10px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e9ecef",
        height: "100%",
      };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
        <Button variant="primary" onClick={fetchData} className="ms-3">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <DonationRequest
        user={{ id: schoolId }}
        loading={loading}
        completionPercentage={100}
        profileData={{}}
        showDonationModal={showDonationModal}
        setShowDonationModal={setShowDonationModal}
      />

      {/* Search and Filter UI */}
      <div className="mb-4">
        <Row>
          <Col md={8}>
            <div className="input-group">
              <span className="input-group-text">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by donor, item, amount, status or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  backgroundColor: darkMode ? "#2c3b57" : "white",
                  color: darkMode ? "#e9ecef" : "black",
                  borderColor: darkMode ? "#1e2a44" : "#ced4da",
                }}
              />
            </div>
          </Col>
          <Col md={4}>
            <div className="input-group">
              <span className="input-group-text">
                <FontAwesomeIcon icon={faFilter} />
              </span>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  backgroundColor: darkMode ? "#2c3b57" : "white",
                  color: darkMode ? "#e9ecef" : "black",
                  borderColor: darkMode ? "#1e2a44" : "#ced4da",
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </Col>
        </Row>
      </div>

      {/* Dashboard Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card style={{ ...cardStyle, borderLeft: "4px solid #28a745" }}>
            <Card.Body className="text-center">
              <FontAwesomeIcon
                icon={faMoneyBillWave}
                size="lg"
                className="mb-3 text-success"
              />
              <Card.Title>Monetary Donations</Card.Title>
              <h3>KSH {totalAmount.toLocaleString()}</h3>
              <p className="text-muted mb-0">{moneyCount} monetary donations</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card style={{ ...cardStyle, borderLeft: "4px solid #17a2b8" }}>
            <Card.Body className="text-center">
              <FontAwesomeIcon
                icon={faBoxOpen}
                size="lg"
                className="mb-3 text-info"
              />
              <Card.Title>Item Donations</Card.Title>
              <h3>{itemCount}</h3>
              <p className="text-muted mb-0">
                {itemCount} item donations received
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card style={{ ...cardStyle, borderLeft: "4px solid #6c757d" }}>
            <Card.Body className="text-center">
              <FontAwesomeIcon
                icon={faHandHoldingHeart}
                size="lg"
                className="mb-3 text-secondary"
              />
              <Card.Title>Total Donations</Card.Title>
              <h3>{donationsReceived.length}</h3>
              <p className="text-muted mb-0">
                {filteredDonations.filter((d) => d.status === "Pending").length}{" "}
                pending
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Donations Received Table */}
      <div className="mb-4">
        <Card style={cardStyle}>
          <Card.Header
            className={
              darkMode ? "bg-dark text-light" : "bg-primary text-white"
            }
          >
            <h4 className="mb-0">Donations Received</h4>
          </Card.Header>
          <Card.Body>
            <Table
              responsive
              striped
              bordered
              hover
              variant={darkMode ? "dark" : ""}
            >
              <thead
                className={
                  darkMode ? "bg-dark text-light" : "bg-primary text-white"
                }
              >
                <tr>
                  <th>Donor</th>
                  <th>Type</th>
                  <th>Amount/Items</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDonations.length > 0 ? (
                  paginatedDonations.map((donation, index) => (
                    <tr key={index}>
                      <td>{donation.donorName}</td>
                      <td>
                        <Badge
                          bg={donation.type === "money" ? "success" : "info"}
                        >
                          {donation.type}
                        </Badge>
                      </td>
                      <td>
                        {donation.type === "money"
                          ? `KES ${donation.amount || 0}`
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">
                      No donations found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            {donationsTotalPages > 1 && (
              <Pagination className="justify-content-center">
                <Pagination.Prev
                  onClick={() =>
                    setDonationsCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={donationsCurrentPage === 1}
                />
                {Array.from({ length: donationsTotalPages }, (_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === donationsCurrentPage}
                    onClick={() => setDonationsCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() =>
                    setDonationsCurrentPage((prev) =>
                      Math.min(prev + 1, donationsTotalPages)
                    )
                  }
                  disabled={donationsCurrentPage === donationsTotalPages}
                />
              </Pagination>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Donation Requests Table */}
      <div className="mb-4">
        <Card style={cardStyle}>
          <Card.Header
            className={
              darkMode ? "bg-dark text-light" : "bg-primary text-white"
            }
          >
            <h4 className="mb-0">Donation Requests</h4>
          </Card.Header>
          <Card.Body>
            <Table
              responsive
              striped
              bordered
              hover
              variant={darkMode ? "dark" : ""}
            >
              <thead
                className={
                  darkMode ? "bg-dark text-light" : "bg-primary text-white"
                }
              >
                <tr>
                  <th>Donation Needs</th>
                  <th>Custom Request</th>
                  <th>Status</th>
                  <th>Date Requested</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.length > 0 ? (
                  paginatedRequests.map((request, index) => (
                    <tr key={index}>
                      <td>{request.donationNeeds?.join(", ") || "None"}</td>
                      <td>{request.customRequest || "None"}</td>
                      <td>
                        <span
                          className={`badge ${
                            request.status === "Pending"
                              ? "bg-warning"
                              : request.status === "Approved"
                              ? "bg-success"
                              : request.status === "Rejected"
                              ? "bg-danger"
                              : "bg-primary"
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td>
                        {request.date
                          ? new Date(request.date).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center">
                      No requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            {requestsTotalPages > 1 && (
              <Pagination className="justify-content-center">
                <Pagination.Prev
                  onClick={() =>
                    setRequestsCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={requestsCurrentPage === 1}
                />
                {Array.from({ length: requestsTotalPages }, (_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === requestsCurrentPage}
                    onClick={() => setRequestsCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() =>
                    setRequestsCurrentPage((prev) =>
                      Math.min(prev + 1, requestsTotalPages)
                    )
                  }
                  disabled={requestsCurrentPage === requestsTotalPages}
                />
              </Pagination>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default SchoolsDonationTab;
