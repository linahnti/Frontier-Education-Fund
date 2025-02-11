import React, { useEffect, useState } from "react";
import axios from "axios";
import ProfileStatusBanner from "../components/ProfileStatusBanner";

const DonorDashboard = () => {
  const [profileStatus, setProfileStatus] = useState({
    profileCompleted: false,
    missingFields: [],
  });

  useEffect(() => {
    const fetchProfileStatus = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/users/profile/check",
          { withCredentials: true } // Ensures cookies are sent for authentication.
        );
        setProfileStatus({ profileCompleted: true, missingFields: [] });
      } catch (error) {
        if (error.response && error.response.status === 400) {
          setProfileStatus({
            profileCompleted: false,
            missingFields: error.response.data.missingFields,
          });
        }
      }
    };

    fetchProfileStatus();
  }, []);

  return (
    <div className="container mt-5">
      <ProfileStatusBanner
        profileCompleted={profileStatus.profileCompleted}
        missingFields={profileStatus.missingFields}
      />
      <h2>Welcome to the Donor Dashboard</h2>
      <p>Here you can manage your donations and explore schools in need.</p>
      {profileStatus.profileCompleted ? (
        <button className="btn btn-primary">Make a Donation</button>
      ) : (
        <button className="btn btn-secondary" disabled>
          Complete Your Profile to Donate
        </button>
      )}
    </div>
  );
};

export default DonorDashboard;
