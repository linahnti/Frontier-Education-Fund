import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Table, Row, Col, Modal, Form } from "react-bootstrap";
import { calculateProfileCompletion } from "./ProfileUtils";

const DonationRequest = ({
  user,
  loading,
  completionPercentage,
  profileData,
}) => {
  const navigate = useNavigate();
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showProfileWarningModal, setShowProfileWarningModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedNeeds, setSelectedNeeds] = useState([]);
  const [customRequest, setCustomRequest] = useState(""); // New state for custom request
  const [localUser, setLocalUser] = useState(null);

  // Initialize requests state
  const [requests, setRequests] = useState([
    {
      id: 1,
      category: "Learning Materials",
      description: "Textbooks for Grade 10",
      status: "Pending",
    },
    {
      id: 2,
      category: "Infrastructure",
      description: "New Classroom Construction",
      status: "Approved",
    },
    {
      id: 3,
      category: "Health & Hygiene",
      description: "Sanitary Towels",
      status: "Completed",
    },
  ]);

  // Load user data from props or localStorage if not available
  useEffect(() => {
    if (user) {
      setLocalUser(user);
    } else {
      // Fallback to localStorage if user prop is not available
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("Loaded user from localStorage:", parsedUser);
          setLocalUser(parsedUser);
        } catch (error) {
          console.error("Failed to parse user from localStorage:", error);
        }
      }
    }
  }, [user]);

  // Use the shared function to check profile completeness
  const isProfileComplete = localUser
    ? profileData
      ? calculateProfileCompletion(localUser, profileData).isProfileComplete
      : false
    : false;

  // Handle donation request submission
  const handleDonationRequest = async () => {
    const token = localStorage.getItem("token");
    const currentUser = localUser || user;

    console.log("User object before API call:", currentUser);
    console.log("Selected needs before sending request:", selectedNeeds);
    console.log("Custom request before sending:", customRequest);

    const userId = currentUser.id || currentUser._id;

    if (!currentUser || !userId) {
      setMessage("User not found. Please log in again.");
      setShowMessageModal(true);
      return;
    }

    // Use schoolId (which is user._id)
    const schoolId = userId;

    if (selectedNeeds.length === 0 && !customRequest) {
      setMessage("Please select at least one need or add a custom request.");
      setShowMessageModal(true);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/schools/${schoolId}/donation-needs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            schoolId: schoolId,
            donationNeeds: selectedNeeds,
            customRequest: customRequest, // Include custom request
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend error:", errorData);
        throw new Error(errorData.message || "Failed to update donation needs");
      }

      const data = await response.json();
      console.log("Donation needs updated:", data);

      setMessage("Your donation needs have been updated successfully!");
      setShowMessageModal(true);

      // Reset form fields
      setShowDonationModal(false);
      setSelectedNeeds([]);
      setCustomRequest(""); // Reset custom request
    } catch (error) {
      console.error("Error updating donation needs:", error);
      setMessage(error.message);
      setShowMessageModal(true);
    }
  };

  // Handle selection of needs
  const handleNeedSelection = (need) => {
    setSelectedNeeds((prev) => {
      const updatedNeeds = prev.includes(need)
        ? prev.filter((n) => n !== need) // Remove the need if it's already selected
        : [...prev, need]; // Add the need if it's not selected

      console.log("Updated selectedNeeds:", updatedNeeds); // Debugging log
      return updatedNeeds;
    });
  };

  // Handle clicking the "Post a Donation Request" button
  const handlePostDonationClick = () => {
    if (completionPercentage < 100) {
      setShowProfileWarningModal(true); // Show profile warning modal
      return;
    }
    setShowDonationModal(true); // Show donation request modal
  };

  // If still loading, show a loading indicator
  if (loading) {
    return <p>Loading donation request data...</p>;
  }

  return (
    <div className="mt-4">
      {/* Button to open donation request modal */}
      <Button
        variant="warning"
        className="text-white shadow-sm mb-4"
        onClick={handlePostDonationClick}
        disabled={loading}
      >
        Ask for Support
      </Button>

      {/* Profile Warning Modal */}
      <Modal
        show={showProfileWarningModal}
        onHide={() => setShowProfileWarningModal(false)}
        centered
      >
        <Modal.Header closeButton className="bg-warning text-white">
          <Modal.Title>Complete Your Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-dark">
            Your profile is only {completionPercentage}% complete. Please
            complete your profile before posting a donation request.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowProfileWarningModal(false)}
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowProfileWarningModal(false);
              navigate("/profile");
            }}
          >
            Go to Profile
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Donation Request Modal */}
      <Modal
        show={showDonationModal}
        onHide={() => setShowDonationModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-warning text-white">
          <Modal.Title>Ask for Support</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Grouped Needs by Categories */}
            <h5>📚 Learning Materials</h5>
            {["Books", "Stationery", "Desks", "Chairs"].map((need) => (
              <Form.Check
                key={need}
                type="checkbox"
                label={need}
                checked={selectedNeeds.includes(need)}
                onChange={() => handleNeedSelection(need)}
              />
            ))}

            <h5 className="mt-4">🏫 Infrastructure</h5>
            {["Classrooms", "Toilets", "Water Tanks"].map((need) => (
              <Form.Check
                key={need}
                type="checkbox"
                label={need}
                checked={selectedNeeds.includes(need)}
                onChange={() => handleNeedSelection(need)}
              />
            ))}

            <h5 className="mt-4">💰 Financial Aid</h5>
            {["School Fees Support", "Sponsorships"].map((need) => (
              <Form.Check
                key={need}
                type="checkbox"
                label={need}
                checked={selectedNeeds.includes(need)}
                onChange={() => handleNeedSelection(need)}
              />
            ))}

            <h5 className="mt-4">💡 Utilities & Services</h5>
            {["Electricity", "Internet", "Security"].map((need) => (
              <Form.Check
                key={need}
                type="checkbox"
                label={need}
                checked={selectedNeeds.includes(need)}
                onChange={() => handleNeedSelection(need)}
              />
            ))}

            <h5 className="mt-4">🏥 Health & Hygiene</h5>
            {["Sanitary Towels", "First Aid Kits", "Clean Drinking Water"].map(
              (need) => (
                <Form.Check
                  key={need}
                  type="checkbox"
                  label={need}
                  checked={selectedNeeds.includes(need)}
                  onChange={() => handleNeedSelection(need)}
                />
              )
            )}

            <h5 className="mt-4">🍛 Food Supplies</h5>
            {["Lunch Programs", "Clean Water"].map((need) => (
              <Form.Check
                key={need}
                type="checkbox"
                label={need}
                checked={selectedNeeds.includes(need)}
                onChange={() => handleNeedSelection(need)}
              />
            ))}

            <Form.Group className="mt-4">
              <Form.Label>Custom Request</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Add other needs"
                value={customRequest}
                onChange={(e) => setCustomRequest(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDonationModal(false)}
          >
            Close
          </Button>
          <Button variant="primary" onClick={handleDonationRequest}>
            Submit Request
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Message Modal */}
      <Modal
        show={showMessageModal}
        onHide={() => setShowMessageModal(false)}
        centered
      >
        <Modal.Header closeButton className="bg-warning text-white">
          <Modal.Title>Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{message}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="warning"
            className="text-white"
            onClick={() => setShowMessageModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Donation Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm text-center">
            <Card.Body>
              <Card.Title>Total Donations Received</Card.Title>
              <h3>10</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm text-center">
            <Card.Body>
              <Card.Title>Pending Requests</Card.Title>
              <h3>5</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm text-center">
            <Card.Body>
              <Card.Title>Active Donors</Card.Title>
              <h3>3</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Donation Requests Table */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Card.Title>Recent Donation Requests</Card.Title>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Category</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? (
                requests.map((req, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{req.category}</td>
                    <td>{req.description}</td>
                    <td>{req.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No requests yet
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DonationRequest;
