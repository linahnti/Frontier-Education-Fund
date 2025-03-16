import React, { useState, useEffect } from "react";
import { ProgressBar } from "react-bootstrap";
import axios from "axios";
import { calculateProfileCompletion } from "./ProfileUtils";

const ProfileCompletionProgress = ({ user, setCompletionPercentage }) => {
  const [profileData, setProfileData] = useState(null);
  const [completionPercentage, setLocalCompletionPercentage] = useState(0); // Define local state

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Fetched Profile Data:", response.data);
        setProfileData(response.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  useEffect(() => {
    if (!user || !profileData) return;

    // Use the shared function to calculate completion
    const { completionPercentage, isProfileComplete } =
      calculateProfileCompletion(user, profileData);
    setLocalCompletionPercentage(completionPercentage); // Update local state
    setCompletionPercentage(completionPercentage); // Update parent state

    // Update the user object if the profile is complete
    if (isProfileComplete) {
      const updatedUser = { ...user, isProfileComplete: true };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  }, [user, profileData, setCompletionPercentage]);

  return (
    <div>
      <h4>
        {user.role.toLowerCase() === "school"
          ? "School Profile"
          : "Donor Profile"}
      </h4>
      <ProgressBar
        now={completionPercentage}
        label={`${completionPercentage}%`}
        className="mb-3"
      />
      <p>Click the button below to update your profile.</p>
    </div>
  );
};

export default ProfileCompletionProgress;
