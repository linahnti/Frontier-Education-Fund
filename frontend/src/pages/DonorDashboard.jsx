import React from "react";
import { useNavigate } from "react-router-dom";

const DonorDashboard = () => {
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
      <h2>Welcome to the Donor Dashboard</h2>
      <p>Here you can make donations, view your donation history, and explore schools in need.</p>

      <div className="d-flex gap-3 mt-3">
        <a
          href="#"
          onClick={(e) => handleLinkClick(e, "/make-donation")}
          className="btn btn-primary"
        >
          Make a Donation
        </a>
        <a
          href="#"
          onClick={(e) => handleLinkClick(e, "/donation-history")}
          className="btn btn-info"
        >
          View Donation History
        </a>
        <a
          href="#"
          onClick={(e) => handleLinkClick(e, "/explore-schools")}
          className="btn btn-success"
        >
          Explore Schools
        </a>
      </div>
    </div>
  );
};

export default DonorDashboard;
