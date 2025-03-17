import React, { useState } from "react";
import { Container, Row, Col, Tabs, Tab } from "react-bootstrap";
import ManageDonations from "./ManageDonations";
import ManageSchools from "./ManageSchools";
import ManageUsers from "./ManageUsers";
import ManageDonationRequests from "./ManageDonationRequests"; // Import the new component
import AdminNavbar from "../components/AdminNavbar";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("donations");

  return (
    <>
      <AdminNavbar /> {/* Add the Admin Navbar */}
      <Container className="mt-5">
        <Row>
          <Col>
            <h1 className="text-center mb-4">Admin Dashboard</h1>
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              id="admin-tabs"
              className="mb-3"
            >
              <Tab eventKey="donations" title="Manage Donations">
                <ManageDonations />
              </Tab>
              <Tab eventKey="schools" title="Manage Schools">
                <ManageSchools />
              </Tab>
              <Tab eventKey="users" title="Manage Users">
                <ManageUsers />
              </Tab>
              {/* Add the new Donation Requests tab */}
              <Tab eventKey="donation-requests" title="Donation Requests">
                <ManageDonationRequests />
              </Tab>
            </Tabs>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AdminDashboard;
