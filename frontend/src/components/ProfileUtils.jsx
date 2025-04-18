export const calculateProfileCompletion = (user, profileData) => {
  if (!user || !profileData)
    return { completionPercentage: 0, isProfileComplete: false };

  let requiredFields = [];
  if (user.role.toLowerCase() === "school") {
    requiredFields = [
      "name",
      "email",
      "contactNumber",
      "schoolDetails.schoolName",
      "schoolDetails.location",
      "schoolDetails.needs",
      "schoolDetails.principalName",
      "schoolDetails.schoolType",
      "schoolDetails.numStudents",
      "schoolDetails.accreditation",
      "schoolDetails.website",
      "schoolDetails.missionStatement",
    ];
  } else if (user.role.toLowerCase() === "donor") {
    requiredFields = [
      "name",
      "email",
      "contactNumber",
      "donorDetails.donorType",
      "donorDetails.organizationName",
      "donorDetails.registrationNumber",
      "donorDetails.taxExemptStatus",
      "donorDetails.occupation",
      "donorDetails.donationCategories",
      "donorDetails.annualBudget",
      "donorDetails.donationFrequency",
    ];

    if (profileData.donorDetails?.donorType !== "Individual") {
      requiredFields.push("donorDetails.organizationAffiliation");
    }
  }

  const allData = { ...user, ...profileData }; // Combine user and profile data

  const completedFields = requiredFields.filter((field) => {
    const value = field.split(".").reduce((obj, key) => obj?.[key], allData);
    return value !== "" && value !== null && value !== undefined;
  }).length;

  const completionPercentage = Math.round(
    (completedFields / requiredFields.length) * 100
  );
  const isProfileComplete = completionPercentage === 100;

  return { completionPercentage, isProfileComplete };
};
