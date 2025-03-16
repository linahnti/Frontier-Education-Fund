import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Container, Badge, Button, Modal } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const ExploreSchools = () => {
  const [schools, setSchools] = useState([]);
  const [donationRequests, setDonationRequests] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/schools")
      .then((response) => {
        setSchools(response.data);
        setLoading(false);
        response.data.forEach((school) => {
          fetchDonationRequests(school._id);
        });
      })
      .catch((error) => {
        console.error("Error fetching schools:", error);
        setError("Failed to fetch schools. Please try again later.");
        setLoading(false);
      });
  }, []);

  const fetchDonationRequests = async (schoolId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/donation-requests/school/${schoolId}`
      );
      setDonationRequests((prevRequests) => ({
        ...prevRequests,
        [schoolId]: response.data,
      }));
    } catch (error) {
      console.error("Error fetching donation requests:", error);
    }
  };

  const handleDonate = (schoolId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.isProfileComplete) {
      setShowModal(true);
      setSelectedSchoolId(schoolId);
    } else {
      navigate(`/donate/${schoolId}`);
    }
  };

  if (loading) {
    return <p>Loading schools...</p>;
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  return (
    <Container>
      {schools.map((school) => (
        <Card key={school._id} style={{ width: "100%", marginBottom: "16px" }}>
          <Card.Body>
            <Card.Title style={{ color: "#007BFF", fontWeight: "bold" }}>
              {school.schoolName}
            </Card.Title>
            <div>
              <strong>Location:</strong> {school.location}
              <br />
              <strong>Contact:</strong> {school.contactNumber}
              <br />
              <strong>Principal:</strong> {school.principalName}
              <br />
              <strong>Donation Needs:</strong>{" "}
              {donationRequests[school._id] &&
              donationRequests[school._id].length > 0 ? (
                donationRequests[school._id].map((request, index) => (
                  <span key={index}>
                    {request.donationNeeds.map((need, idx) => (
                      <Badge
                        key={idx}
                        style={{
                          backgroundColor: "#28A745",
                          margin: "2px",
                          fontSize: "0.9em",
                        }}
                      >
                        {need}
                      </Badge>
                    ))}
                    {request.customRequest && (
                      <p>
                        <strong>Custom Request:</strong> {request.customRequest}
                      </p>
                    )}
                  </span>
                ))
              ) : (
                <span>No donation needs listed</span>
              )}
            </div>
            <Button
              variant="warning"
              style={{ backgroundColor: "#FFC107", border: "none" }}
              onClick={() => handleDonate(school._id)}
            >
              Donate
            </Button>
          </Card.Body>
        </Card>
      ))}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-warning text-white">
          <Modal.Title>Profile Incomplete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-dark">
            Please complete your profile to make a donation.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            as={Link}
            to="/profile"
            onClick={() => setShowModal(false)}
          >
            Go to Profile
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ExploreSchools;
