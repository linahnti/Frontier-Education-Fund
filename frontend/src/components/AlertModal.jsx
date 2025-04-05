import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useTheme } from "../contexts/ThemeContext";
import "../styles/AlertModal.css";

const AlertModal = ({ show, onHide, title, message, variant = "danger" }) => {
  const { darkMode } = useTheme();

  // Color scheme definitions
  const colorSchemes = {
    danger: {
      bg: darkMode ? "#2d1e1e" : "#fff8e6", // Dark red/light yellow
      text: darkMode ? "#ffcc00" : "#d32f2f", // Yellow/red
      border: darkMode ? "#ff5722" : "#ffb74d", // Orange
      button: darkMode ? "#ff5722" : "#f57c00", // Orange
    },
    warning: {
      bg: darkMode ? "#1e1e2d" : "#e6f7ff", // Dark blue/light blue
      text: darkMode ? "#4fc3f7" : "#0288d1", // Light blue/dark blue
      border: darkMode ? "#2196f3" : "#4fc3f7", // Blue
      button: darkMode ? "#2196f3" : "#0288d1", // Blue
    },
    success: {
      bg: darkMode ? "#1e2d1e" : "#e8f5e9", // Dark green/light green
      text: darkMode ? "#8bc34a" : "#388e3c", // Light green/dark green
      border: darkMode ? "#4caf50" : "#81c784", // Green
      button: darkMode ? "#4caf50" : "#388e3c", // Green
    },
  };

  const colors = colorSchemes[variant] || colorSchemes.danger;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      className={darkMode ? "dark-theme-modal" : "light-theme-modal"}
    >
      <Modal.Header
        closeButton
        closeVariant={darkMode ? "white" : undefined}
        style={{
          backgroundColor: darkMode ? "#121212" : "#ffffff",
          borderBottom: `2px solid ${colors.border}`,
          color: darkMode ? "white" : "black",
        }}
      >
        <Modal.Title style={{ fontWeight: "600" }}>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          borderLeft: `3px solid ${colors.border}`,
          borderRight: `3px solid ${colors.border}`,
        }}
      >
        {message}
      </Modal.Body>
      <Modal.Footer
        style={{
          backgroundColor: darkMode ? "#121212" : "#ffffff",
          borderTop: `2px solid ${colors.border}`,
        }}
      >
        <Button
          variant={darkMode ? "outline-light" : undefined}
          style={{
            backgroundColor: colors.button,
            borderColor: colors.border,
            color: darkMode ? "white" : "white",
            fontWeight: "500",
          }}
          onClick={onHide}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AlertModal;
