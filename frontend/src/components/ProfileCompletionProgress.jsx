import React, { useState, useEffect } from "react";
import { ProgressBar } from "react-bootstrap";
import axios from "axios";
import { calculateProfileCompletion } from "./ProfileUtils";
import { useProfile } from "../contexts/ProfileContext";

const ProfileCompletionProgress = ({ user, setCompletionPercentage }) => {
  const { isProfileComplete, setIsProfileComplete } = useProfile();
  const [profileData, setProfileData] = useState(null);
  const [completionPercentage, setLocalCompletionPercentage] = useState(0);

  // Fetch profile data on component mount
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
        setProfileData(response.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  // Calculate profile completion when user or profileData changes
  useEffect(() => {
    if (!user || !profileData) return;

    const { completionPercentage, isProfileComplete } =
      calculateProfileCompletion(user, profileData);

    setLocalCompletionPercentage(completionPercentage);
    setCompletionPercentage(completionPercentage);
    setIsProfileComplete(isProfileComplete);

    setIsProfileComplete(isProfileComplete);

    if (isProfileComplete) {
      const updatedUser = { ...user, isProfileComplete: true };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  }, [user, profileData, setCompletionPercentage, setIsProfileComplete]);

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
