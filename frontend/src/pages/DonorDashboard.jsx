import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";

const DonorDashboard = () => {
  return (
    <Container className="mt-5">
      <Row>
        <Col className="text-center">
          <h1>Donor Dashboard</h1>
          <p>Welcome, Donor! Here you can donate to schools in need.</p>
          <Button variant="warning" className="mt-3">
            Donate Now
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default DonorDashboard;
