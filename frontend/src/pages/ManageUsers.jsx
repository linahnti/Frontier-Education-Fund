import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Badge,
  ButtonGroup,
  Pagination,
  Dropdown,
  InputGroup,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../config";
import SearchInput from "../components/SearchInput";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [roleFilter, setRoleFilter] = useState("All");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to fetch users. Please try again later.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search query and role filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "All" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-light">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      {/* Search and Filter Bar */}
      <div className="search-filter-container mb-4">
        <Row className="g-3">
          <Col md={8}>
            <SearchInput
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Col>
          <Col md={4}>
            <Dropdown>
              <Dropdown.Toggle
                variant="outline-secondary"
                id="dropdown-role-filter"
              >
                Filter by Role: {roleFilter}
              </Dropdown.Toggle>
              <Dropdown.Menu className="filter-dropdown">
                <Dropdown.Item onClick={() => setRoleFilter("All")}>
                  All
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setRoleFilter("Admin")}>
                  Admin
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setRoleFilter("Donor")}>
                  Donor
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setRoleFilter("School")}>
                  School
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>
      </div>

      {/* Users Table */}
      <Table striped bordered hover variant="dark" responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user, index) => (
            <tr key={user._id}>
              <td>{indexOfFirstUser + index + 1}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <Badge
                  bg={
                    user.role === "Admin"
                      ? "danger"
                      : user.role === "School"
                      ? "info"
                      : "primary"
                  }
                >
                  {user.role}
                </Badge>
              </td>
              <td>
                <ButtonGroup className="d-flex flex-wrap gap-2">
                  <Button variant="outline-warning" size="sm">
                    <i className="bi bi-pencil"></i> Edit
                  </Button>
                  <Button variant="outline-danger" size="sm">
                    <i className="bi bi-trash"></i> Delete
                  </Button>
                </ButtonGroup>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      {filteredUsers.length > usersPerPage && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            {Array.from({
              length: Math.ceil(filteredUsers.length / usersPerPage),
            }).map((_, index) => (
              <Pagination.Item
                key={index + 1}
                active={index + 1 === currentPage}
                onClick={() => paginate(index + 1)}
                className="bg-dark text-light"
              >
                {index + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
