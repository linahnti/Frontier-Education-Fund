import React from "react";
import { ListGroup } from "react-bootstrap";

const SchoolsNotifications = ({ notifications }) => {
  return (
    <div>
      <h4>Notifications</h4>
      {notifications.length > 0 ? (
        <ListGroup>
          {notifications.map((note, index) => (
            <ListGroup.Item key={index}>{note}</ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <p>No notifications to display.</p>
      )}
    </div>
  );
};

export default SchoolsNotifications;
