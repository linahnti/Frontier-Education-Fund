import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { useTheme } from "../contexts/ThemeContext";

const DonationRequest = ({
  user,
  loading,
  completionPercentage,
  profileData,
}) => {
  const { darkMode } = useTheme();
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showProfileWarningModal, setShowProfileWarningModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedNeeds, setSelectedNeeds] = useState([]);
  const [customRequest, setCustomRequest] = useState("");

  // Handle donation request submission
  const handleDonationRequest = async () => {
    const token = localStorage.getItem("token");
    const currentUser = user;

    if (!currentUser) {
      setMessage("User not found. Please log in again.");
      setShowMessageModal(true);
      return;
    }

    // Use `currentUser.id` instead of `currentUser._id`
    const schoolId = currentUser.id;

    if (!schoolId) {
      setMessage("School ID is undefined. Please log in again.");
      setShowMessageModal(true);
      return;
    }

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
            customRequest: customRequest,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update donation needs");
      }

      const data = await response.json();
      setMessage("Your donation needs have been updated successfully!");
      setShowMessageModal(true);

      // Reset form fields
      setShowDonationModal(false);
      setSelectedNeeds([]);
      setCustomRequest("");
    } catch (error) {
      console.error("Error updating donation needs:", error);
      setMessage(error.message);
      setShowMessageModal(true);
    }
  };

  // Handle selection of needs
  const handleNeedSelection = (need) => {
    setSelectedNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    );
  };

  // Handle clicking the "Post a Donation Request" button
  const handlePostDonationClick = () => {
    if (completionPercentage < 100) {
      setShowProfileWarningModal(true);
      return;
    }
    setShowDonationModal(true);
  };

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
        contentClassName={darkMode ? "bg-dark text-white" : ""}
      >
        <Modal.Header closeButton className="bg-warning text-white">
          <Modal.Title>Complete Your Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode ? "bg-dark" : ""}>
          <p className="text-dark">
            Your profile is only {completionPercentage}% complete. Please
            complete your profile before posting a donation request.
          </p>
        </Modal.Body>
        <Modal.Footer className={darkMode ? "bg-dark border-secondary" : ""}>
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
        contentClassName={darkMode ? "bg-dark text-white" : ""}
      >
        <Modal.Header closeButton className="bg-warning text-white">
          <Modal.Title>Ask for Support</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode ? "bg-dark" : ""}>
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
              <Form.Label className={darkMode ? "text-white" : ""}>
                Custom Request
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Add other needs"
                value={customRequest}
                onChange={(e) => setCustomRequest(e.target.value)}
                className={darkMode ? "bg-secondary text-white" : ""}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className={darkMode ? "bg-dark border-secondary" : ""}>
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
        contentClassName={darkMode ? "bg-dark text-white" : ""}
      >
        <Modal.Header closeButton className="bg-warning text-white">
          <Modal.Title>Message</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode ? "bg-dark" : ""}>
          <p className={darkMode ? "text-white" : ""}>{message}</p>
        </Modal.Body>
        <Modal.Footer className={darkMode ? "bg-dark border-secondary" : ""}>
          <Button
            variant="warning"
            className="text-white"
            onClick={() => setShowMessageModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DonationRequest;
