import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";

const SchoolDashboard = () => {
  return (
    <Container className="mt-5">
      <Row>
        <Col className="text-center">
          <h1>School Dashboard</h1>
          <p>Welcome, School Admin! Here you can view and update your needs.</p>
          <Button variant="success" className="mt-3">
            Update Donation Needs
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default SchoolDashboard;
