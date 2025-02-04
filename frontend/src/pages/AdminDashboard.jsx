import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";

const AdminDashboard = () => {
  return (
    <Container className="mt-5">
      <Row>
        <Col className="text-center">
          <h1>Admin Dashboard</h1>
          <p>Welcome, Admin! This is where you manage the platform.</p>
          <Button variant="primary" className="mt-3">
            Manage Schools
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
