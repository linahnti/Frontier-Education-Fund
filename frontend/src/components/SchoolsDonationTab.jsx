import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Row,
  Col,
  Modal,
  Button,
  Pagination,
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
} from "@fortawesome/free-solid-svg-icons";

const SchoolsDonationTab = ({
  schoolId,
  showDonationModal,
  setShowDonationModal,
}) => {
  const { darkMode } = useTheme();
  const [donationsReceived, setDonationsReceived] = useState([]);
  const [donationRequests, setDonationRequests] = useState([]);
  const [activeDonors, setActiveDonors] = useState([]);
  const [showActiveDonorsModal, setShowActiveDonorsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [donationsCurrentPage, setDonationsCurrentPage] = useState(1);
  const [requestsCurrentPage, setRequestsCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Function to fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!schoolId) {
        console.error("School ID is undefined");
        return;
      }

      // Fetch all data in parallel
      const [donationsResponse, requestsResponse, activeDonorsResponse] =
        await Promise.all([
          axios.get(`${API_URL}/api/schools/${schoolId}/donations-received`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/api/schools/${schoolId}/donation-requests`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/api/schools/${schoolId}/active-donors`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      console.log("Donations received:", donationsResponse.data);
      console.log("Donation requests:", requestsResponse.data);
      console.log("Active donors:", activeDonorsResponse.data);

      setDonationsReceived(donationsResponse.data);
      setDonationRequests(requestsResponse.data);
      setActiveDonors(activeDonorsResponse.data.activeDonors || []);
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
      const searchMatch =
        searchTerm === "" ||
        donation.donorId?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        donation.item?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // Pagination logic
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

  // Calculate total donation amount in KSH
  const totalDonationAmount = donationsReceived.reduce((total, donation) => {
    return total + (donation.amount || 0);
  }, 0);

  // Fetch data on component mount and set up polling
  useEffect(() => {
    fetchData(); // Fetch data immediately on mount

    // Set up polling to fetch data every 10 seconds
    const intervalId = setInterval(fetchData, 10000);

    // Cleanup interval on component unmount
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
                placeholder="Search by donor, item, status or date..."
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
        <Col md={6}>
          <Card style={{ ...cardStyle, borderLeft: "4px solid #ffc107" }}>
            <Card.Body className="text-center">
              <div className="icon-circle mb-3 mx-auto">
                <FontAwesomeIcon icon={faHandHoldingHeart} size="lg" />
              </div>
              <Card.Title>Donations Received</Card.Title>
              <h3>KSH {totalDonationAmount.toLocaleString()}</h3>
              <p className="text-muted mb-0">
                {filteredDonations.length} donations total
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card style={{ ...cardStyle, borderLeft: "4px solid #0d6efd" }}>
            <Card.Body className="text-center">
              <div className="icon-circle mb-3 mx-auto">
                <FontAwesomeIcon icon={faHandHoldingHeart} size="lg" />
              </div>
              <Card.Title>Donation Requests</Card.Title>
              <h3>{filteredRequests.length}</h3>
              <p className="text-muted mb-0">
                {filteredRequests.filter((r) => r.status === "Pending").length}{" "}
                pending requests
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
                  <th>Item</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDonations.length > 0 ? (
                  paginatedDonations.map((donation, index) => (
                    <tr key={index}>
                      <td>{donation.donorId?.name || "N/A"}</td>
                      <td>{donation.item || "N/A"}</td>
                      <td>
                        <span
                          className={`badge ${
                            donation.status === "Pending"
                              ? "bg-warning"
                              : donation.status === "Approved"
                              ? "bg-success"
                              : donation.status === "Rejected"
                              ? "bg-danger"
                              : "bg-primary"
                          }`}
                        >
                          {donation.status}
                        </span>
                      </td>
                      <td>
                        {donation.date
                          ? new Date(donation.date).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center">
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

      {/* Active Donors Modal */}
      <Modal
        show={showActiveDonorsModal}
        onHide={() => setShowActiveDonorsModal(false)}
        contentClassName={darkMode ? "bg-dark text-light" : ""}
        centered
        size="lg"
      >
        <Modal.Header
          closeButton
          closeVariant={darkMode ? "white" : undefined}
          className={
            darkMode
              ? "bg-dark text-light border-secondary"
              : "bg-primary text-white"
          }
        >
          <Modal.Title>Active Donors</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode ? "bg-dark text-light" : ""}>
          <Table
            responsive
            striped
            bordered
            hover
            variant={darkMode ? "dark" : ""}
          >
            <thead
              className={
                darkMode ? "bg-secondary text-light" : "bg-primary text-white"
              }
            >
              <tr>
                <th>Donor Name</th>
                <th>Email</th>
                <th>Donations Made</th>
              </tr>
            </thead>
            <tbody>
              {activeDonors.length > 0 ? (
                activeDonors.map((donor, index) => (
                  <tr key={index}>
                    <td>{donor.name}</td>
                    <td>{donor.email}</td>
                    <td>{donor.donationsMade?.length || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center">
                    No active donors found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer className={darkMode ? "bg-dark border-secondary" : ""}>
          <Button
            variant={darkMode ? "outline-light" : "primary"}
            onClick={() => setShowActiveDonorsModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SchoolsDonationTab;
