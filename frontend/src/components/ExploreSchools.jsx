import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  Container,
  Badge,
  Button,
  Modal,
  Accordion,
  Form,
  Row,
  Col,
  Pagination,
  InputGroup,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import { API_URL } from "../config";

const ExploreSchools = () => {
  const { darkMode } = useTheme();
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [donationRequests, setDonationRequests] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const schoolsPerPage = 10;

  useEffect(() => {
    axios
      .get(`${API_URL}/api/schools`)
      .then((response) => {
        setSchools(response.data);
        setFilteredSchools(response.data);
        setLoading(false);
        response.data.forEach((school) => {
          fetchDonationRequests(school._id);
        });
      })
      .catch((error) => {
        console.error("Error fetching schools:", error);
        setError("Failed to fetch schools. Please try again later.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const results = schools.filter((school) => {
      const matchesSearch =
        school.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.location.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterOption === "all") return matchesSearch;

      if (filterOption === "urgent") {
        const requests = donationRequests[school._id] || [];
        return matchesSearch && requests.some((request) => request.urgency);
      }

      if (filterOption === "hasRequests") {
        const requests = donationRequests[school._id] || [];
        return matchesSearch && requests.length > 0;
      }

      return matchesSearch;
    });
    setFilteredSchools(results);
    setCurrentPage(1);
  }, [searchTerm, filterOption, schools, donationRequests]);

  const fetchDonationRequests = async (schoolId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/donation-requests/school/${schoolId}`
      );

      const activeRequests = response.data
        .filter((request) => request.status !== "Completed")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setDonationRequests((prevRequests) => ({
        ...prevRequests,
        [schoolId]: activeRequests,
      }));
    } catch (error) {
      console.error("Error fetching donation requests:", error);
    }
  };

  const handleDonate = (schoolId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.isProfileComplete) {
      setShowModal(true);
    } else {
      navigate(`/donate?schoolId=${schoolId}`);
    }
  };

  // Pagination logic
  const indexOfLastSchool = currentPage * schoolsPerPage;
  const indexOfFirstSchool = indexOfLastSchool - schoolsPerPage;
  const currentSchools = filteredSchools.slice(
    indexOfFirstSchool,
    indexOfLastSchool
  );
  const totalPages = Math.ceil(filteredSchools.length / schoolsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <p>Loading schools...</p>;
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  return (
    <Container className="py-4">
      {/* Header with search and filter */}
      <div
        className={`mb-4 p-3 rounded ${darkMode ? "bg-dark" : "bg-light"}`}
        style={{
          zIndex: 1000,
          boxShadow: darkMode
            ? "0 2px 8px rgba(0,0,0,0.4)"
            : "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Row className="align-items-center mb-3">
          <Col md={6}>
            <h2 className={`mb-0 ${darkMode ? "text-white" : "text-dark"}`}>
              Find Schools to Support
            </h2>
          </Col>
          <Col md={6} className="d-flex justify-content-end">
            <ThemeToggle />
          </Col>
        </Row>

        <Row>
          <Col md={8}>
            <InputGroup className="mb-3">
              <Form.Control
                type="text"
                placeholder=" 🔍 Search by school name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  backgroundColor: "white",
                  color: "black",
                  borderColor: "#ced4da",
                }}
              />
              <InputGroup.Text
                style={{
                  backgroundColor: "white",
                  color: "black",
                  borderColor: "#ced4da",
                }}
              >
                <i className="bi bi-search"></i>
              </InputGroup.Text>
            </InputGroup>
          </Col>
          <Col md={4}>
            <Form.Select
              value={filterOption}
              onChange={(e) => setFilterOption(e.target.value)}
              className={
                darkMode ? "bg-secondary text-white border-secondary" : ""
              }
            >
              <option value="all">All Schools</option>
              <option value="hasRequests">Schools with Needs</option>
              <option value="urgent">Urgent Needs Only</option>
            </Form.Select>
          </Col>
        </Row>
      </div>

      {/* School cards */}
      {currentSchools.length > 0 ? (
        <>
          {currentSchools.map((school) => (
            <Card
              key={school._id}
              className={`mb-4 ${darkMode ? "border-secondary" : ""}`}
              style={{
                backgroundColor: darkMode ? "var(--color-card)" : "white",
                color: darkMode ? "var(--color-text)" : "inherit",
              }}
            >
              <Card.Body>
                <Card.Title
                  style={{
                    color: darkMode ? "var(--color-primary)" : "#007BFF",
                    fontWeight: "bold",
                  }}
                >
                  {school.schoolName}
                </Card.Title>
                <div>
                  <strong>Location:</strong> {school.location}
                  <br />
                  <strong>Contact:</strong> {school.contactNumber}
                  <br />
                  <strong>Principal:</strong> {school.principalName}
                  <br />
                  <strong>Donation Needs:</strong>{" "}
                  {donationRequests[school._id] &&
                  donationRequests[school._id].length > 0 ? (
                    <Accordion className="mt-2">
                      {donationRequests[school._id].map((request, index) => (
                        <Accordion.Item
                          eventKey={index.toString()}
                          key={index}
                          style={{
                            backgroundColor: darkMode
                              ? "var(--color-card)"
                              : "white",
                            color: darkMode ? "var(--color-text)" : "inherit",
                          }}
                        >
                          <Accordion.Header
                            style={{
                              backgroundColor: darkMode
                                ? "var(--color-bg-secondary)"
                                : "white",
                            }}
                          >
                            Request {index + 1} -{" "}
                            {new Date(request.createdAt).toLocaleDateString()}
                            {request.urgency && (
                              <Badge bg="danger" className="ms-2">
                                Urgent
                              </Badge>
                            )}
                          </Accordion.Header>
                          <Accordion.Body>
                            <div>
                              {request.donationNeeds.map((need, idx) => (
                                <Badge
                                  key={idx}
                                  style={{
                                    backgroundColor: darkMode
                                      ? "var(--color-primary)"
                                      : "#007BFF",
                                    margin: "2px",
                                    fontSize: "0.9em",
                                    color: "white",
                                  }}
                                  className="me-1 mb-1"
                                >
                                  {need}
                                </Badge>
                              ))}
                              {request.customRequest && (
                                <p className="mt-2 mb-1">
                                  <strong>Custom Request:</strong>{" "}
                                  {request.customRequest}
                                </p>
                              )}
                              <p className="mb-1">
                                <strong>Status:</strong> {request.status}
                              </p>
                              <Button
                                variant="warning"
                                size="sm"
                                onClick={() => handleDonate(school._id)}
                                className="mt-2"
                                style={{
                                  backgroundColor: "#FFC107",
                                  border: "none",
                                  color: "white",
                                }}
                              >
                                Donate
                              </Button>
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  ) : (
                    <span>No active donation needs</span>
                  )}
                </div>
                <Button
                  variant="warning"
                  style={{
                    backgroundColor: "#FFC107",
                    border: "none",
                    color: "white",
                  }}
                  onClick={() => handleDonate(school._id)}
                  className="mt-3"
                >
                  Donate
                </Button>
              </Card.Body>
            </Card>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination className={darkMode ? "dark-pagination" : ""}>
                <Pagination.Prev
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                />
                {Array.from({ length: totalPages }, (_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => paginate(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() =>
                    paginate(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <div
          className={`text-center py-5 ${
            darkMode ? "text-white" : "text-dark"
          }`}
        >
          <h4>No schools match your search criteria</h4>
          <Button
            variant="primary"
            onClick={() => {
              setSearchTerm("");
              setFilterOption("all");
            }}
            className="mt-3"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Profile Incomplete Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        contentClassName={darkMode ? "bg-dark text-white" : ""}
      >
        <Modal.Header closeButton className="bg-warning text-white">
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
    </Container>
  );
};

export default ExploreSchools;
