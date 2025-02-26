import React from "react";
import { ProgressBar } from "react-bootstrap";

const ProfileCompletionProgress = ({ user }) => {
  console.log("User Object in Progress Component:", user); // <-- Add this line

  // Calculate profile completion percentage
  const calculateProfileCompletion = (userData) => {
    if (!userData) return 0; // Handle case where userData is null or undefined

    // List all required fields for a complete profile
    const requiredFields = [
      "name",
      "email",
      "schoolDetails.schoolName",
      "schoolDetails.location",
      "schoolDetails.needs",
      "schoolDetails.principalName",
      "schoolDetails.schoolType",
      "schoolDetails.numStudents",
      "schoolDetails.accreditation",
      "schoolDetails.website",
      "schoolDetails.missionStatement",
      "schoolDetails.contactNumber",
    ];

    // Count how many required fields are filled
    const completedFields = requiredFields.filter((field) => {
      const value = field.split(".").reduce((obj, key) => obj?.[key], userData);
      return value !== "" && value !== null && value !== undefined;
    }).length;

    // Calculate the completion percentage
    return Math.round((completedFields / requiredFields.length) * 100);
  };

  const completionPercentage = calculateProfileCompletion(user);

  return (
    <div>
      <h4>School Profile</h4>
      <ProgressBar
        now={completionPercentage}
        label={`${completionPercentage}%`}
        className="mb-3"
      />
      <p>Click the button below to update your school profile.</p>
    </div>
  );
};

export default ProfileCompletionProgress;
