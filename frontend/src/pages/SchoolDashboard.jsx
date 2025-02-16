import React from "react";
import ProfileCheck from "../components/ProfileCheck";

const SchoolDashboard = () => {
  return (
    <div className="container mt-5">
      <ProfileCheck /> {/* Checks profile and shows warning if incomplete */}
      <h2>Welcome to the School Dashboard</h2>
      <p>Here you can manage your school profile and post donation requests.</p>
      <div className="d-flex gap-3 mt-3">
        <button className="btn btn-primary">Post a Donation Request</button>
        <button className="btn btn-info">View Donations Received</button>
        <button className="btn btn-success">Manage School Profile</button>
      </div>
    </div>
  );
};

export default SchoolDashboard;
