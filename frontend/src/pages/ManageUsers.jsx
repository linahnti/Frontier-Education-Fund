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
  Modal,
  Form,
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "",
  });
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [donorDonations, setDonorDonations] = useState([]);

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

  const fetchDonorDonations = async (donorId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/admin/donors/${donorId}/donations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDonorDonations(response.data);
      setSelectedDonor(donorId);
    } catch (error) {
      console.error("Error fetching donor donations:", error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "All" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleEditClick = (user) => {
    setCurrentUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/api/admin/users/${currentUser._id}`,
        editFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Update the local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === currentUser._id ? { ...user, ...editFormData } : user
          )
        );
        setShowEditModal(false);
        showTemporaryFeedback("User updated successfully");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      showTemporaryFeedback("Error updating user", "danger");
    }
  };

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
          <tr
            onClick={() =>
              user.role === "Donor" && fetchDonorDonations(user._id)
            }
          >
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
                  <Button
                    variant="outline-warning"
                    size="sm"
                    onClick={() => handleEditClick(user)}
                  >
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

      {selectedDonor && (
        <Modal show={true} onHide={() => setSelectedDonor(null)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Donor Contributions</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>School</th>
                  <th>Type</th>
                  <th>Amount/Items</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {donorDonations.map((donation) => (
                  <tr key={donation._id}>
                    <td>{new Date(donation.date).toLocaleDateString()}</td>
                    <td>{donation.schoolName || "N/A"}</td>
                    <td>{donation.type}</td>
                    <td>
                      {donation.type === "money"
                        ? `KES ${donation.amount}`
                        : donation.items.join(", ")}
                    </td>
                    <td>{donation.status}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Modal.Body>
        </Modal>
      )}

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

      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={editFormData.name}
                onChange={handleEditFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={editFormData.email}
                onChange={handleEditFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={editFormData.role}
                onChange={handleEditFormChange}
              >
                <option value="Admin">Admin</option>
                <option value="Donor">Donor</option>
                <option value="School">School</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageUsers;
