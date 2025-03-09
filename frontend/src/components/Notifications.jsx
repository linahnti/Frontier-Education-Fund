import React from "react";
import { Alert } from "react-bootstrap";

const Notifications = ({ notifications }) => {
  return (
    <div>
      {notifications.length > 0 ? (
        <Alert variant="info">
          {notifications.map((note, index) => (
            <p key={index}>{note.message}</p>
          ))}
        </Alert>
      ) : (
        <p>No new notifications.</p>
      )}
    </div>
  );
};

export default Notifications;