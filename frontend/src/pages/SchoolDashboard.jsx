import React from "react";
import { useNavigate } from "react-router-dom";

const SchoolDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // Function to handle link clicks
  const handleLinkClick = (e, path) => {
    if (!user || !user.isProfileComplete) {
      e.preventDefault();
      // Trigger a message in the profile icon dropdown to inform the user
      alert("Please complete your profile before proceeding.");
      return; // Prevent navigation if profile is incomplete
    }
    // If the profile is complete, navigate to the intended path
    navigate(path);
  };

  return (
    <div className="container mt-5">
      <h2>Welcome to the School Dashboard</h2>
      <p>Here you can manage your school profile and post donation requests.</p>

      <div className="d-flex gap-3 mt-3">
        <a
          href="#"
          onClick={(e) => handleLinkClick(e, "/post-donation")}
          className="btn btn-primary"
        >
          Post a Donation Request
        </a>
        <a
          href="#"
          onClick={(e) => handleLinkClick(e, "/donations-received")}
          className="btn btn-info"
        >
          View Donations Received
        </a>
        <a
          href="#"
          onClick={(e) => handleLinkClick(e, "/manage-school-profile")}
          className="btn btn-success"
        >
          Manage School Profile
        </a>
      </div>
    </div>
  );
};

export default SchoolDashboard;
