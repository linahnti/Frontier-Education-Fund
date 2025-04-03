import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useTheme } from "../contexts/ThemeContext";

const ErrorModal = ({ show, onHide, message }) => {
  const { darkMode } = useTheme();

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header
        closeButton
        className={darkMode ? "bg-dark text-light" : ""}
      >
        <Modal.Title>
          <i className="bi bi-exclamation-triangle-fill me-2 text-danger"></i>
          Error
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={darkMode ? "bg-dark text-light" : ""}>
        {message}
      </Modal.Body>
      <Modal.Footer className={darkMode ? "bg-dark" : ""}>
        <Button
          variant={darkMode ? "outline-light" : "primary"}
          onClick={onHide}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ErrorModal;
