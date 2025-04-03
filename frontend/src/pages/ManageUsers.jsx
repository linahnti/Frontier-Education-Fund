import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Badge,
  ButtonGroup,
  Form,
  Pagination,
} from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../config";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10); // Number of users per page

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/admin/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
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

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <p>Loading users...</p>;
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  return (
    <div>
      {/* Search Bar */}
      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search by name or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Form.Group>

      {/* Users Table */}
      <Table striped bordered hover>
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
                <Badge bg={user.role === "Admin" ? "danger" : "primary"}>
                  {user.role}
                </Badge>
              </td>
              <td>
                <ButtonGroup style={{ gap: "8px" }}>
                  <Button variant="warning" size="sm">
                    Edit
                  </Button>
                  <Button variant="danger" size="sm">
                    Delete
                  </Button>
                </ButtonGroup>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <Pagination>
        {Array.from({
          length: Math.ceil(filteredUsers.length / usersPerPage),
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
  );
};

export default ManageUsers;
