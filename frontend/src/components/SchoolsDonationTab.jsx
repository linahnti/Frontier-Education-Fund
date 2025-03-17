import React, { useEffect, useState } from "react";
import { Table, Card, Row, Col, Modal, Button } from "react-bootstrap";
import axios from "axios";

const SchoolsDonationTab = ({ schoolId }) => {
  // Use schoolId prop
  const [donationsReceived, setDonationsReceived] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeDonors, setActiveDonors] = useState([]);
  const [showActiveDonorsModal, setShowActiveDonorsModal] = useState(false);

  // Fetch donations received, pending requests, and active donors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Validate schoolId
        if (!schoolId) {
          console.error("School ID is undefined");
          return;
        }

        // Fetch donations received
        const donationsResponse = await axios.get(
          `http://localhost:5000/api/schools/${schoolId}/donations-received`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDonationsReceived(donationsResponse.data);

        // Fetch pending requests
        const requestsResponse = await axios.get(
          `http://localhost:5000/api/schools/${schoolId}/donation-requests`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setPendingRequests(requestsResponse.data);

        // Fetch active donors
        const activeDonorsResponse = await axios.get(
          `http://localhost:5000/api/schools/${schoolId}/active-donors`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setActiveDonors(activeDonorsResponse.data.activeDonors);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [schoolId]); // Use schoolId as the dependency

  return (
    <div>
      {/* Donations Received Table */}
      <div id="donations-received-table">
        <h4>Donations Received</h4>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Donor</th>
              <th>Item</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {donationsReceived.map((donation, index) => (
              <tr key={index}>
                <td>{donation.donorId?.name || "N/A"}</td>
                <td>{donation.item}</td>
                <td>{donation.status}</td>
                <td>{new Date(donation.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Cards for Donations Received, Pending Requests, and Active Donors */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm text-center">
            <Card.Body>
              <Card.Title>Donations Received</Card.Title>
              <h3>{donationsReceived.length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm text-center">
            <Card.Body>
              <Card.Title>Pending Requests</Card.Title>
              <h3>{pendingRequests.length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card
            className="shadow-sm text-center"
            onClick={() => setShowActiveDonorsModal(true)}
            style={{ cursor: "pointer" }}
          >
            <Card.Body>
              <Card.Title>Active Donors</Card.Title>
              <h3>{activeDonors.length}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pending Requests Table */}
      <div id="pending-requests-table">
        <h4>Pending Requests</h4>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Donation Need</th>
              <th>Status</th>
              <th>Date Requested</th>
            </tr>
          </thead>
          <tbody>
            {pendingRequests.map((request, index) => (
              <tr key={index}>
                <td>{request.donationNeeds.join(", ")}</td>
                <td>{request.status}</td>
                <td>{new Date(request.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Modal for Active Donors */}
      <Modal
        show={showActiveDonorsModal}
        onHide={() => setShowActiveDonorsModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Active Donors</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Donor Name</th>
                <th>Email</th>
                <th>Donations Made</th>
              </tr>
            </thead>
            <tbody>
              {activeDonors.map((donor, index) => (
                <tr key={index}>
                  <td>{donor.name}</td>
                  <td>{donor.email}</td>
                  <td>{donor.donationsMade.length}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowActiveDonorsModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SchoolsDonationTab;
