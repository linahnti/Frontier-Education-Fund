import React from "react";

const ProfileStatusBanner = ({ profileCompleted, missingFields }) => {
  if (profileCompleted) return null; // Don't display if the profile is complete.

  return (
    <div className="alert alert-warning" role="alert">
      <strong>Your profile is incomplete!</strong>
      <p>
        Missing information:{" "}
        {missingFields.map((field, index) => (
          <span key={index} className="badge bg-danger me-1">
            {field}
          </span>
        ))}
      </p>
      Some features may be unavailable.{" "}
      <a href="/complete-profile" className="alert-link">
        Complete your profile
      </a>{" "}
      to unlock all features.
    </div>
  );
};

export default ProfileStatusBanner;
