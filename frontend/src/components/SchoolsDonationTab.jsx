import React from "react";
import { Button, Table } from "react-bootstrap";

const SchoolsDonationTab = ({ user, profileData }) => {
  return (
    <div>
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
          {profileData?.donationsReceived?.map((donation, index) => (
            <tr key={index}>
              <td>{donation.donorId}</td>
              <td>{donation.item}</td>
              <td>{donation.status}</td>
              <td>{new Date(donation.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Button variant="primary">Request Donation</Button>
    </div>
  );
};

export default SchoolsDonationTab;
