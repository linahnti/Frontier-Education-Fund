import React, { useEffect, useState } from "react";
import { Table, Button, Badge, ButtonGroup } from "react-bootstrap";
import axios from "axios";

const ManageSchools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/schools");
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

  if (loading) {
    return <p>Loading schools...</p>;
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>#</th>
          <th>School Name</th>
          <th>Location</th>
          <th>Contact</th>
          <th>Principal</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {schools.map((school, index) => (
          <tr key={school._id}>
            <td>{index + 1}</td>
            <td>{school.schoolName}</td>
            <td>{school.location}</td>
            <td>{school.contactNumber}</td>
            <td>{school.principalName}</td>
            <td>
              {/* Use ButtonGroup to align buttons side by side */}
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
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ManageSchools;
