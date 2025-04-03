import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

const ProfileCompletionModal = ({ show, onHide }) => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header
        closeButton
        className={darkMode ? "bg-dark text-light" : ""}
      >
        <Modal.Title>Profile Incomplete</Modal.Title>
      </Modal.Header>
      <Modal.Body className={darkMode ? "bg-dark text-light" : ""}>
        <p>
          You need to complete your profile before submitting support tickets.
        </p>
        <p>Please complete all required fields in your profile.</p>
      </Modal.Body>
      <Modal.Footer className={darkMode ? "bg-dark border-secondary" : ""}>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => navigate("/profile")}>
          Go to Profile
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProfileCompletionModal;
