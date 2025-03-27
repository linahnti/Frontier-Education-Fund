import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Badge,
} from "react-bootstrap";
import { useTheme } from "../contexts/ThemeContext";

const Schools = () => {
  const { darkMode } = useTheme();
  const [filter, setFilter] = useState("all");

  const schools = [
    {
      id: 1,
      name: "Turkana Girls' Secondary School",
      location: "Turkana County",
      students: 450,
      needs: ["Classrooms", "Textbooks", "Sanitary Towels"],
      status: "High Need",
      joined: "2018-03-15",
    },
    {
      id: 2,
      name: "Mandera DEB Primary School",
      location: "Mandera County",
      students: 620,
      needs: ["Water Tanks", "Desks", "Security Fence"],
      status: "Critical Need",
      joined: "2017-11-02",
    },
    {
      id: 3,
      name: "Garissa High School",
      location: "Garissa County",
      students: 780,
      needs: ["Science Lab", "Library Books"],
      status: "Moderate Need",
      joined: "2019-05-22",
    },
    {
      id: 4,
      name: "Kakuma Refugee Primary",
      location: "Turkana County",
      students: 1200,
      needs: ["Teachers", "Classrooms", "Food Program"],
      status: "Critical Need",
      joined: "2020-01-10",
    },
  ];

  const filteredSchools = filter === "all" 
    ? schools 
    : schools.filter(school => school.status.includes(filter));

  return (
    <Container className={`py-5 ${darkMode ? "text-white" : ""}`}>
      <Row className="mb-4">
        <Col>
          <h1 className="display-4">Schools in Need</h1>
          <p className="lead">
            Discover schools you can support and track their progress
          </p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Filter by Need Level</Form.Label>
            <Form.Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={darkMode ? "bg-dark text-white" : ""}
            >
              <option value="all">All Schools</option>
              <option value="High">High Need</option>
              <option value="Critical">Critical Need</option>
              <option value="Moderate">Moderate Need</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={8} className="d-flex align-items-end justify-content-end">
          <Button variant="warning" className="me-2">
            <i className="fas fa-download me-2"></i>Export Data
          </Button>
          <Button variant="primary">
            <i className="fas fa-plus me-2"></i>Add New School
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className={darkMode ? "bg-dark" : ""}>
            <Card.Body>
              <Table striped bordered hover variant={darkMode ? "dark" : ""}>
                <thead>
                  <tr>
                    <th>School Name</th>
                    <th>Location</th>
                    <th>Students</th>
                    <th>Current Needs</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchools.map((school) => (
                    <tr key={school.id}>
                      <td>{school.name}</td>
                      <td>{school.location}</td>
                      <td>{school.students.toLocaleString()}</td>
                      <td>
                        {school.needs.map((need, idx) => (
                          <Badge
                            key={idx}
                            bg="primary"
                            className="me-1 mb-1"
                          >
                            {need}
                          </Badge>
                        ))}
                      </td>
                      <td>
                        <Badge
                          bg={
                            school.status.includes("Critical")
                              ? "danger"
                              : school.status.includes("High")
                              ? "warning"
                              : "info"
                          }
                        >
                          {school.status}
                        </Badge>
                      </td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="me-2">
                          View
                        </Button>
                        <Button variant="outline-success" size="sm">
                          Donate
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-5">
        <Col md={6}>
          <Card className={`h-100 ${darkMode ? "bg-dark" : ""}`}>
            <Card.Body>
              <Card.Title>School Impact Map</Card.Title>
              <div
                className="d-flex align-items-center justify-content-center"
                style={{ height: "300px", backgroundColor: darkMode ? "#333" : "#f8f9fa" }}
              >
                <p className="text-muted">Interactive map visualization here</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className={`h-100 ${darkMode ? "bg-dark" : ""}`}>
            <Card.Body>
              <Card.Title>Recent School Updates</Card.Title>
              <div className="timeline">
                {[
                  "New classrooms completed at Turkana Girls (May 2023)",
                  "Water tank installed at Mandera DEB (April 2023)",
                  "Textbook distribution at Garissa High (March 2023)",
                ].map((update, idx) => (
                  <div key={idx} className="timeline-item mb-3">
                    <div className="timeline-badge bg-success"></div>
                    <p className="mb-0">{update}</p>
                    <small className="text-muted">2 weeks ago</small>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Schools;