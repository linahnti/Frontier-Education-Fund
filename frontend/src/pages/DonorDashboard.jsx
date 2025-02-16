import React from "react";
import { Link } from "react-router-dom";
// import ProfileCheck from "../components/ProfileCheck";

const DonorDashboard = () => {
  return (
    <div className="container mt-5">
      {/* <ProfileCheck /> Checks profile and shows warning if incomplete */}
      <h2>Welcome to the Donor Dashboard</h2>
      <p>Here you can manage your donations and explore schools in need.</p>
      <div className="d-flex gap-3 mt-3">
        <Link className="btn btn-primary">Make a Donation</Link>
        <Link className="btn btn-info">View Donation History</Link>
        <Link className="btn btn-success">Explore Schools</Link>
      </div>
    </div>
  );
};

export default DonorDashboard;
