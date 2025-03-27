import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Tab,
  Tabs,
  Table,
  Button,
  ProgressBar,
  Form,
  Badge,
} from "react-bootstrap";
import { useTheme } from "../contexts/ThemeContext";

const Donations = () => {
  const { darkMode } = useTheme();
  const [key, setKey] = useState("all");

  const donations = [
    {
      id: 1,
      date: "2023-05-15",
      school: "Turkana Girls' Secondary",
      amount: "KES 50,000",
      type: "Money",
      status: "Completed",
      items: [],
    },
    {
      id: 2,
      date: "2023-04-22",
      school: "Mandera DEB Primary",
      amount: "",
      type: "Materials",
      status: "Delivered",
      items: ["Textbooks", "Desks"],
    },
    {
      id: 3,
      date: "2023-03-10",
      school: "Garissa High School",
      amount: "KES 25,000",
      type: "Money",
      status: "Processing",
      items: [],
    },
  ];

  const filteredDonations =
    key === "all"
      ? donations
      : donations.filter((d) =>
          key === "completed"
            ? d.status === "Completed"
            : d.status !== "Completed"
        );

  const DonationTable = ({ donations, darkMode }) => (
    <Table striped bordered hover variant={darkMode ? "dark" : ""}>
      <thead>
        <tr>
          <th>Date</th>
          <th>School</th>
          <th>Amount/Items</th>
          <th>Type</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {donations.map((donation) => (
          <tr key={donation.id}>
            <td>{donation.date}</td>
            <td>{donation.school}</td>
            <td>
              {donation.amount || (
                <ul className="mb-0">
                  {donation.items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
            </td>
            <td>{donation.type}</td>
            <td>
              <Badge
                bg={
                  donation.status === "Completed"
                    ? "success"
                    : donation.status === "Processing"
                    ? "warning"
                    : "primary"
                }
              >
                {donation.status}
              </Badge>
            </td>
            <td>
              <Button variant="outline-info" size="sm">
                Details
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <Container className={`py-5 ${darkMode ? "text-white" : ""}`}>
      <Row className="mb-4">
        <Col>
          <h1 className="display-4">Your Donations</h1>
          <p className="lead">Track your contributions and see their impact</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className={darkMode ? "bg-dark" : ""}>
            <Card.Body>
              <h5 className="card-title">Donation Summary</h5>
              <Row>
                <Col md={4}>
                  <div className="text-center p-3">
                    <h3 className="text-primary">KES 75,000</h3>
                    <p className="text-muted">Total Donated</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center p-3">
                    <h3 className="text-success">3</h3>
                    <p className="text-muted">Schools Supported</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center p-3">
                    <h3 className="text-warning">150+</h3>
                    <p className="text-muted">Students Impacted</p>
                  </div>
                </Col>
              </Row>
              <ProgressBar
                now={65}
                label="65% of annual goal"
                variant="success"
                className="mt-3"
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Tabs
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className={`mb-3 ${darkMode ? "tabs-dark" : ""}`}
          >
            <Tab eventKey="all" title="All Donations">
              <DonationTable
                donations={filteredDonations}
                darkMode={darkMode}
              />
            </Tab>
            <Tab eventKey="completed" title="Completed">
              <DonationTable
                donations={filteredDonations}
                darkMode={darkMode}
              />
            </Tab>
            <Tab eventKey="active" title="Active">
              <DonationTable
                donations={filteredDonations}
                darkMode={darkMode}
              />
            </Tab>
          </Tabs>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={6}>
          <Card className={`h-100 ${darkMode ? "bg-dark" : ""}`}>
            <Card.Body>
              <Card.Title>Quick Donate</Card.Title>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Select School</Form.Label>
                  <Form.Select className={darkMode ? "bg-dark text-white" : ""}>
                    <option>Turkana Girls' Secondary</option>
                    <option>Mandera DEB Primary</option>
                    <option>Garissa High School</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Donation Type</Form.Label>
                  <Form.Select className={darkMode ? "bg-dark text-white" : ""}>
                    <option>Monetary</option>
                    <option>Materials</option>
                    <option>Both</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Amount (KES)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter amount"
                    className={darkMode ? "bg-dark text-white" : ""}
                  />
                </Form.Group>
                <Button variant="primary" className="w-100">
                  Proceed to Donate
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className={`h-100 ${darkMode ? "bg-dark" : ""}`}>
            <Card.Body>
              <Card.Title>Recent Impact</Card.Title>
              <div className="impact-stories">
                {[
                  "Your donation helped build 2 new classrooms at Turkana Girls",
                  "50 students received textbooks from your contribution",
                  "Water tank installation completed at Mandera DEB",
                ].map((story, idx) => (
                  <div
                    key={idx}
                    className="impact-item mb-3 p-3 border rounded"
                  >
                    <p className="mb-0">{story}</p>
                    <small className="text-muted">May 15, 2023</small>
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

const DonationTable = ({ donations, darkMode }) => (
  <Table striped bordered hover variant={darkMode ? "dark" : ""}>
    <thead>
      <tr>
        <th>Date</th>
        <th>School</th>
        <th>Amount/Items</th>
        <th>Type</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {donations.map((donation) => (
        <tr key={donation.id}>
          <td>{donation.date}</td>
          <td>{donation.school}</td>
          <td>
            {donation.amount || (
              <ul className="mb-0">
                {donation.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            )}
          </td>
          <td>{donation.type}</td>
          <td>
            <Badge
              bg={
                donation.status === "Completed"
                  ? "success"
                  : donation.status === "Processing"
                  ? "warning"
                  : "primary"
              }
            >
              {donation.status}
            </Badge>
          </td>
          <td>
            <Button variant="outline-info" size="sm">
              Details
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
);

export default Donations;
