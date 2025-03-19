import React, { useEffect, useState } from "react";
import { Table, Card, Row, Col, Modal, Button } from "react-bootstrap";
import axios from "axios";
import DonationRequest from "./DonationRequest";

const SchoolsDonationTab = ({ schoolId }) => {
  const [donationsReceived, setDonationsReceived] = useState([]);
  const [donationRequests, setDonationRequests] = useState([]);
  const [activeDonors, setActiveDonors] = useState([]);
  const [showActiveDonorsModal, setShowActiveDonorsModal] = useState(false);

  // Function to fetch data
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

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

      // Fetch all donation requests
      const requestsResponse = await axios.get(
        `http://localhost:5000/api/schools/${schoolId}/donation-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDonationRequests(requestsResponse.data);

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

  // Fetch data on component mount and set up polling
  useEffect(() => {
    fetchData(); // Fetch data immediately on mount

    // Set up polling to fetch data every 10 seconds
    const intervalId = setInterval(fetchData, 10000); // 10 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [schoolId]); // Re-run effect if schoolId changes

  return (
    <div>
      {/* Add the DonationRequest component at the top */}
      <DonationRequest
        user={{ id: schoolId }}
        loading={false}
        completionPercentage={100}
        profileData={{}}
      />

      {/* Donations Received Table */}
      <div id="donations-received-table" className="mb-4">
        <h4 className="text-primary mb-3">Donations Received</h4>
        <Table striped bordered hover className="shadow-sm">
          <thead className="bg-primary text-white">
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

      {/* Cards for Donations Received, Donation Requests, and Active Donors */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm text-center border-primary">
            <Card.Body>
              <Card.Title className="text-primary">
                Donations Received
              </Card.Title>
              <h3 className="text-primary">{donationsReceived.length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm text-center border-primary">
            <Card.Body>
              <Card.Title className="text-primary">
                Donation Requests
              </Card.Title>
              <h3 className="text-primary">{donationRequests.length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card
            className="shadow-sm text-center border-primary"
            onClick={() => setShowActiveDonorsModal(true)}
            style={{ cursor: "pointer" }}
          >
            <Card.Body>
              <Card.Title className="text-primary">Active Donors</Card.Title>
              <h3 className="text-primary">{activeDonors.length}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Donation Requests Table */}
      <div id="donation-requests-table" className="mb-4">
        <h4 className="text-primary mb-3">Donation Requests</h4>
        <Table striped bordered hover className="shadow-sm">
          <thead className="bg-primary text-white">
            <tr>
              <th>Donation Need</th>
              <th>Status</th>
              <th>Date Requested</th>
            </tr>
          </thead>
          <tbody>
            {donationRequests.map((request, index) => (
              <tr key={index}>
                <td>{request.donationNeeds.join(", ")}</td>
                <td>
                  <span
                    className={`badge ${
                      request.status === "Pending"
                        ? "bg-warning"
                        : request.status === "Approved"
                        ? "bg-success"
                        : request.status === "Rejected"
                        ? "bg-danger"
                        : "bg-primary"
                    }`}
                  >
                    {request.status}
                  </span>
                </td>
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
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Active Donors</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover>
            <thead className="bg-primary text-white">
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
            variant="primary"
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
