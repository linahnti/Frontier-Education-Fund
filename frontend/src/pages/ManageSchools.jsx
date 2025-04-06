import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Badge,
  ButtonGroup,
  InputGroup,
  Dropdown,
  Row,
  Col,
  Alert,
  Pagination,
} from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../config";
import SearchInput from "../components/SearchInput";

const ManageSchools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [schoolsPerPage] = useState(10);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schoolRequests, setSchoolRequests] = useState([]);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/api/admin/schools`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSchools(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching schools:", error);
        setError("Failed to fetch schools. Please try again later.");
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  const fetchSchoolRequests = async (schoolId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/admin/donation-requests`,
        {
          params: { schoolId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSchoolRequests(response.data);
      setSelectedSchool(schoolId);
    } catch (error) {
      console.error("Error fetching school requests:", error);
    }
  };

  const filteredSchools = schools.filter((school) => {
    const matchesSearch =
      school.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.principalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.contactNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation =
      locationFilter === "All" ||
      school.location.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesLocation;
  });

  const indexOfLastSchool = currentPage * schoolsPerPage;
  const indexOfFirstSchool = indexOfLastSchool - schoolsPerPage;
  const currentSchools = filteredSchools.slice(
    indexOfFirstSchool,
    indexOfLastSchool
  );
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const uniqueLocations = [
    ...new Set(schools.map((school) => school.location)),
  ];

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading schools...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <div className="search-filter-container mb-4">
        <Row className="g-3">
          <Col md={8}>
            <SearchInput
              placeholder="Search by school name, principal, or contact"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Col>
          <Col md={4}>
            <Dropdown>
              <Dropdown.Toggle
                variant="outline-secondary"
                id="dropdown-location-filter"
              >
                Location: {locationFilter}
              </Dropdown.Toggle>
              <Dropdown.Menu className="filter-dropdown">
                <Dropdown.Item onClick={() => setLocationFilter("All")}>
                  All Locations
                </Dropdown.Item>
                {uniqueLocations.map((location, index) => (
                  <Dropdown.Item
                    key={index}
                    onClick={() => setLocationFilter(location)}
                  >
                    {location}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>
      </div>

      {filteredSchools.length === 0 ? (
        <Alert variant="info">No schools match your criteria.</Alert>
      ) : (
        <>
          <Table striped bordered hover>
            <thead>
              <tr onClick={() => fetchSchoolRequests(school._id)}>
                <th>#</th>
                <th>School Name</th>
                <th>Location</th>
                <th>Contact</th>
                <th>Principal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentSchools.map((school, index) => (
                <tr key={school._id}>
                  <td>{index + 1}</td>
                  <td>{school.schoolName}</td>
                  <td>{school.location}</td>
                  <td>{school.contactNumber}</td>
                  <td>{school.principalName}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Button variant="warning" size="sm">
                        Edit
                      </Button>
                      <Button variant="danger" size="sm">
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {selectedSchool && (
            <Modal show={true} onHide={() => setSelectedSchool(null)} size="lg">
              <Modal.Header closeButton>
                <Modal.Title>School Requests</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Request Date</th>
                      <th>Items Requested</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schoolRequests.map((request) => (
                      <tr key={request._id}>
                        <td>
                          {new Date(request.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <ul>
                            {request.donationNeeds.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </td>
                        <td>{request.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Modal.Body>
            </Modal>
          )}

          {filteredSchools.length > schoolsPerPage && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                {Array.from({
                  length: Math.ceil(filteredSchools.length / schoolsPerPage),
                }).map((_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === currentPage}
                    onClick={() => paginate(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ManageSchools;
