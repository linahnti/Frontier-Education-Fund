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

const SchoolsDonationTab = ({ schoolId }) => {
  const { darkMode } = useTheme();
  const [donationsReceived, setDonationsReceived] = useState([]);
  const [donationRequests, setDonationRequests] = useState([]);
  const [activeDonors, setActiveDonors] = useState([]);
  const [showActiveDonorsModal, setShowActiveDonorsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Pagination states
  const [donationsCurrentPage, setDonationsCurrentPage] = useState(1);
  const [requestsCurrentPage, setRequestsCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Function to fetch data
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!schoolId) {
        console.error("School ID is undefined");
        return;
      }

      // Fetch donations received
      const donationsResponse = await axios.get(
        `http://localhost:5000/api/schools/${schoolId}/donations-received`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDonationsReceived(donationsResponse.data);

      // Fetch all donation requests
      const requestsResponse = await axios.get(
        `http://localhost:5000/api/schools/${schoolId}/donation-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDonationRequests(requestsResponse.data);

      // Fetch active donors
      const activeDonorsResponse = await axios.get(
        `http://localhost:5000/api/schools/${schoolId}/active-donors`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setActiveDonors(activeDonorsResponse.data.activeDonors);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Filter functions
  const getFilteredDonations = () => {
    return donationsReceived.filter((donation) => {
      const statusMatch =
        filterStatus === "All" || donation.status === filterStatus;
      const searchMatch =
        searchTerm === "" ||
        donation.donorId?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        donation.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        new Date(donation.date).toLocaleDateString().includes(searchTerm);

      return statusMatch && searchMatch;
    });
  };

  const getFilteredRequests = () => {
    return donationRequests.filter((request) => {
      const statusMatch =
        filterStatus === "All" || request.status === filterStatus;
      const searchMatch =
        searchTerm === "" ||
        request.donationNeeds.some((need) =>
          need.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        request.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        new Date(request.date).toLocaleDateString().includes(searchTerm);

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

  // Fetch data on component mount and set up polling
  useEffect(() => {
    fetchData(); // Fetch data immediately on mount

    // Set up polling to fetch data every 10 seconds
    const intervalId = setInterval(fetchData, 10000); // 10 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [schoolId]); // Re-run effect if schoolId changes

  return (
    <div>
      {/* Add the DonationRequest component at the top */}
      <DonationRequest
        user={{ id: schoolId }}
        loading={false}
        completionPercentage={100}
        profileData={{}}
      />

      {/* Search and Filter UI */}
      <div className="search-filter-container mb-4">
        <div className="search-container">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search by donor, item, status or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              backgroundColor: "white",
              color: "black",
            }}
          />
        </div>
        <div className="filter-container">
          <select
            className={`form-select status-filter ${
              darkMode ? "dark-filter" : ""
            }`}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Donations Received Table */}
      <div id="donations-received-table" className="mb-4">
        <h4 className={darkMode ? "text-light mb-3" : "text-primary mb-3"}>
          Donations Received
        </h4>
        <Table
          striped
          bordered
          hover
          className={darkMode ? "table-dark shadow-sm" : "shadow-sm"}
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
                  <td>{donation.item}</td>
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
                  <td>{new Date(donation.date).toLocaleDateString()}</td>
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

        {/* Donations Pagination */}
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
      </div>

      {/* Cards for Donations Received, Donation Requests, and Active Donors */}
      <Row className="mb-4">
        <Col md={4}>
          <Card
            className={`shadow-sm text-center ${
              darkMode ? "bg-dark text-light border-light" : "border-primary"
            }`}
          >
            <Card.Body>
              <Card.Title className={darkMode ? "text-light" : "text-primary"}>
                Donations Received
              </Card.Title>
              <h3 className={darkMode ? "text-light" : "text-primary"}>
                {filteredDonations.length}
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card
            className={`shadow-sm text-center ${
              darkMode ? "bg-dark text-light border-light" : "border-primary"
            }`}
          >
            <Card.Body>
              <Card.Title className={darkMode ? "text-light" : "text-primary"}>
                Donation Requests
              </Card.Title>
              <h3 className={darkMode ? "text-light" : "text-primary"}>
                {filteredRequests.length}
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card
            className={`shadow-sm text-center ${
              darkMode ? "bg-dark text-light border-light" : "border-primary"
            }`}
            onClick={() => setShowActiveDonorsModal(true)}
            style={{ cursor: "pointer" }}
          >
            <Card.Body>
              <Card.Title className={darkMode ? "text-light" : "text-primary"}>
                Active Donors
              </Card.Title>
              <h3 className={darkMode ? "text-light" : "text-primary"}>
                {activeDonors.length}
              </h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Donation Requests Table */}
      <div id="donation-requests-table" className="mb-4">
        <h4 className={darkMode ? "text-light mb-3" : "text-primary mb-3"}>
          Donation Requests
        </h4>
        <Table
          striped
          bordered
          hover
          className={darkMode ? "table-dark shadow-sm" : "shadow-sm"}
        >
          <thead
            className={
              darkMode ? "bg-dark text-light" : "bg-primary text-white"
            }
          >
            <tr>
              <th>Donation Need</th>
              <th>Status</th>
              <th>Date Requested</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRequests.length > 0 ? (
              paginatedRequests.map((request, index) => (
                <tr key={index}>
                  <td>{request.donationNeeds.join(", ")}</td>
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
                  <td>{new Date(request.date).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center">
                  No requests found
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* Requests Pagination */}
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
      </div>

      {/* Modal for Active Donors */}
      <Modal
        show={showActiveDonorsModal}
        onHide={() => setShowActiveDonorsModal(false)}
        contentClassName={darkMode ? "bg-dark text-light" : ""}
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
          <Table striped bordered hover variant={darkMode ? "dark" : undefined}>
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
              {activeDonors.map((donor, index) => (
                <tr key={index}>
                  <td>{donor.name}</td>
                  <td>{donor.email}</td>
                  <td>{donor.donationsMade.length}</td>
                </tr>
              ))}
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
