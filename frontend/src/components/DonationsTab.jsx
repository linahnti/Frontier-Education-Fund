import React, { useState } from "react";
import { Table, Button, Badge, Alert, Modal, Form } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

const DonationsTab = ({ donorId, donations, loading, error }) => {
  const { darkMode } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Filter donations based on search term and status
  const filteredDonations = donations
    ? donations.filter((donation) => {
        const statusMatch =
          filterStatus === "All" || donation.status === filterStatus;

        const searchTermLower = searchTerm.toLowerCase();
        const searchMatch =
          searchTerm === "" ||
          (donation.schoolId?.schoolName &&
            donation.schoolId.schoolName
              .toLowerCase()
              .includes(searchTermLower)) ||
          (donation.type === "money" &&
            `KES ${donation.amount}`.toLowerCase().includes(searchTermLower)) ||
          (donation.items &&
            donation.items
              .join(", ")
              .toLowerCase()
              .includes(searchTermLower)) ||
          donation.status.toLowerCase().includes(searchTermLower) ||
          new Date(donation.date)
            .toLocaleDateString()
            .toLowerCase()
            .includes(searchTermLower);

        return statusMatch && searchMatch;
      })
    : [];

  // Pagination logic
  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDonations.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <h4>Your Donations</h4>

      {/* Search and Filter Section */}
      <div className="search-filter-container mb-4">
        <div className="search-container">
          <Form.Control
            type="text"
            placeholder="Search by school, items, amount, status, or date..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
            style={{
              backgroundColor: "white",
              color: "black",
            }}
          />
        </div>
        <div className="filter-container">
          <Form.Select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1); // Reset to first page when filtering
            }}
            className={darkMode ? "bg-dark text-white" : ""}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Completed">Completed</option>
          </Form.Select>
        </div>
      </div>

      {filteredDonations.length > 0 ? (
        <>
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
              {currentItems.map((donation, index) => (
                <tr key={index}>
                  <td>{indexOfFirstItem + index + 1}</td>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center">
              <nav>
                <ul className="pagination">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => paginate(currentPage - 1)}
                    >
                      &laquo;
                    </button>
                  </li>
                  {[...Array(totalPages).keys()].map((number) => (
                    <li
                      key={number}
                      className={`page-item ${
                        currentPage === number + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => paginate(number + 1)}
                      >
                        {number + 1}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => paginate(currentPage + 1)}
                    >
                      &raquo;
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}

          <div className="mt-2 text-muted">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredDonations.length)} of{" "}
            {filteredDonations.length} donations
          </div>
        </>
      ) : (
        <Alert variant="info">
          {donations && donations.length > 0
            ? "No donations match your search criteria."
            : "No donations found."}
        </Alert>
      )}

      <Button variant="primary" onClick={handleMakeDonation} className="mt-3">
        Donate
      </Button>

      {/* Modal for incomplete profile */}
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
