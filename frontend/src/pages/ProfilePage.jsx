import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ProfilePage.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    role: "", // Will be 'school' or 'donor'
    isProfileComplete: false,
    schoolDetails: {
      schoolName: "",
      location: "",
      needs: [],
      principalName: "",
      schoolType: "",
      numStudents: "",
      accreditation: "",
      website: "",
      missionStatement: "",
      contactNumber: "",
    },
    donorDetails: {
      contactNumber: "",
      donorType: "",
      organizationName: "",
      registrationNumber: "",
      taxExemptStatus: false,
      occupation: "",
      donationCategories: [],
      annualBudget: "",
      donationFrequency: "",
      organizationAffiliation: "",
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedUserInfo, setUpdatedUserInfo] = useState(userInfo);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [donorType, setDonorType] = useState(
    userInfo.donorDetails?.donorType || ""
  );

  // Fetch user details from the backend
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get("http://localhost:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("Backend response:", response.data);
        const fetchedUserInfo = response.data;

        // Normalize role to lowercase if role is present
        if (fetchedUserInfo.role) {
          fetchedUserInfo.role = fetchedUserInfo.role.toLowerCase();
        }

        // Initialize schoolDetails and donorDetails based on the user's role
        if (fetchedUserInfo.role === "school") {
          fetchedUserInfo.schoolDetails = {
            schoolName: fetchedUserInfo.schoolDetails?.schoolName || "",
            location: fetchedUserInfo.schoolDetails?.location || "",
            needs: fetchedUserInfo.schoolDetails?.needs || [],
            principalName: fetchedUserInfo.schoolDetails?.principalName || "",
            schoolType: ["public", "private"].includes(
              fetchedUserInfo.schoolDetails?.schoolType
            )
              ? fetchedUserInfo.schoolDetails.schoolType
              : "",
            numStudents: fetchedUserInfo.schoolDetails?.numStudents || "",
            accreditation:
              fetchedUserInfo.schoolDetails?.accreditation !== undefined
                ? Boolean(fetchedUserInfo.schoolDetails.accreditation)
                : false,
            website: fetchedUserInfo.schoolDetails?.website || "",
            missionStatement:
              fetchedUserInfo.schoolDetails?.missionStatement || "",
            contactNumber: fetchedUserInfo.schoolDetails?.contactNumber || "",
          };
          // Ensure donorDetails is an empty object for school users
          fetchedUserInfo.donorDetails = {};
        } else if (fetchedUserInfo.role === "donor") {
          fetchedUserInfo.donorDetails = {
            contactNumber: fetchedUserInfo.donorDetails?.contactNumber || "",
            donorType: fetchedUserInfo.donorDetails?.donorType || "",
            organizationName:
              fetchedUserInfo.donorDetails?.organizationName || "",
            registrationNumber:
              fetchedUserInfo.donorDetails?.registrationNumber || "",
            taxExemptStatus:
              fetchedUserInfo.donorDetails?.taxExemptStatus || false,
            occupation: fetchedUserInfo.donorDetails?.occupation || "",
            donationCategories:
              fetchedUserInfo.donorDetails?.donationCategories || [],
            annualBudget: fetchedUserInfo.donorDetails?.annualBudget || "",
            donationFrequency:
              fetchedUserInfo.donorDetails?.donationFrequency || "",
            organizationAffiliation:
              fetchedUserInfo.donorDetails?.organizationAffiliation || "",
          };
          // Ensure schoolDetails is an empty object for donor users
          fetchedUserInfo.schoolDetails = {};
        } else {
          // Handle other roles (if any) or default case
          fetchedUserInfo.schoolDetails = {};
          fetchedUserInfo.donorDetails = {};
        }

        // Ensure isProfileComplete is properly interpreted as a boolean
        fetchedUserInfo.isProfileComplete = Boolean(
          fetchedUserInfo.isProfileComplete
        );

        // Set user info and updated user info
        setUserInfo(fetchedUserInfo);
        setUpdatedUserInfo(fetchedUserInfo); // Update updatedUserInfo with fetched data

        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setError("Error fetching user data. Please try again later.");
        setIsLoading(false);
      });
  }, [navigate]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Update the donorType state if the donorType field changes
    if (name === "donorDetails.donorType") {
      setDonorType(value);
    }

    setUpdatedUserInfo((prevState) => {
      if (name.includes(".")) {
        const [mainKey, nestedKey] = name.split(".");
        if (
          type === "checkbox" &&
          Array.isArray(prevState[mainKey][nestedKey])
        ) {
          const newValue = checked
            ? [...prevState[mainKey][nestedKey], value]
            : prevState[mainKey][nestedKey].filter((item) => item !== value);
          return {
            ...prevState,
            [mainKey]: {
              ...prevState[mainKey],
              [nestedKey]: newValue,
            },
          };
        }
        return {
          ...prevState,
          [mainKey]: {
            ...prevState[mainKey],
            [nestedKey]: type === "checkbox" ? checked : value,
          },
        };
      }
      return {
        ...prevState,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  // Update user profile
  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Check if all required fields are filled out
    const isProfileComplete = checkProfileCompleteness(updatedUserInfo);

    // Update the isProfileComplete field
    updatedUserInfo.isProfileComplete = isProfileComplete;

    console.log("Submitting updated user info:", updatedUserInfo);

    axios
      .put("http://localhost:5000/api/users/profile/update", updatedUserInfo, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const { user } = response.data; // Destructure the updated user object from the response
        console.log("Updated user data:", user);

        // Update the frontend state with the updated user object
        setUserInfo(user);
        setUpdatedUserInfo(user);

        setIsEditing(false);
        setError(null);
        setSuccess("Profile updated successfully!");
      })
      .catch((error) => {
        const errorMessage = error.response
          ? error.response.data.message
          : error.message;
        console.error("Error updating profile:", errorMessage);
        setError("Error updating profile. Please try again later.");
        setSuccess(null);
      });
  };
  // Function to check profile completeness
  const checkProfileCompleteness = (userInfo) => {
    if (userInfo.role === "school") {
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
      return requiredFields.every((field) => {
        const value = field
          .split(".")
          .reduce((obj, key) => obj?.[key], userInfo);
        return value !== "" && value !== null && value !== undefined;
      });
    } else if (userInfo.role === "donor") {
      const requiredFields = [
        "name",
        "email",
        "donorDetails.contactNumber",
        "donorDetails.donorType",
        "donorDetails.organizationName",
        "donorDetails.registrationNumber",
        "donorDetails.taxExemptStatus",
        "donorDetails.occupation",
        "donorDetails.donationCategories",
        "donorDetails.annualBudget",
        "donorDetails.donationFrequency",
      ];

      // Add organizationAffiliation to required fields only if donorType is not "Individual"
      if (userInfo.donorDetails.donorType !== "Individual") {
        requiredFields.push("donorDetails.organizationAffiliation");
      }

      return requiredFields.every((field) => {
        const value = field
          .split(".")
          .reduce((obj, key) => obj?.[key], userInfo);
        return value !== "" && value !== null && value !== undefined;
      });
    }
    return false;
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mt-5">
      <h2>Your Profile</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          {/* Common Fields */}
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={updatedUserInfo.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={updatedUserInfo.email}
              onChange={handleChange}
              disabled
            />
          </div>

          {/* Conditional Fields based on Role */}
          {userInfo.role === "school" && (
            <>
              <div className="mb-3">
                <label htmlFor="schoolName" className="form-label">
                  School Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="schoolName"
                  name="schoolDetails.schoolName"
                  placeholder="Official School Name, e.g. ABC Primary School"
                  value={updatedUserInfo.schoolDetails.schoolName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="location" className="form-label">
                  Location
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="location"
                  name="schoolDetails.location"
                  placeholder="Subcounty, County, Address"
                  value={updatedUserInfo.schoolDetails.location}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Needs</label>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="needsBooks"
                    name="schoolDetails.needs"
                    value="Books"
                    checked={updatedUserInfo.schoolDetails.needs.includes(
                      "Books"
                    )}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="needsBooks">
                    Books
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="needsFurniture"
                    name="schoolDetails.needs"
                    value="Furniture"
                    checked={updatedUserInfo.schoolDetails.needs.includes(
                      "Furniture"
                    )}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="needsFurniture">
                    Furniture
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="needsFood"
                    name="schoolDetails.needs"
                    value="Food"
                    checked={updatedUserInfo.schoolDetails.needs.includes(
                      "Food"
                    )}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="needsFood">
                    Food
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="needsUniforms"
                    name="schoolDetails.needs"
                    value="Uniforms"
                    checked={updatedUserInfo.schoolDetails.needs.includes(
                      "Uniforms"
                    )}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="needsUniforms">
                    Uniforms
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="needsSanitaryTowels"
                    name="schoolDetails.needs"
                    value="Sanitary Towels"
                    checked={updatedUserInfo.schoolDetails.needs.includes(
                      "Sanitary Towels"
                    )}
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="needsSanitary Towels"
                  >
                    Sanitary Towels
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="needsMoney"
                    name="schoolDetails.needs"
                    value="Money"
                    checked={updatedUserInfo.schoolDetails.needs.includes(
                      "Money"
                    )}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="needsMoney">
                    Money
                  </label>
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="principalName" className="form-label">
                  Principal Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="principalName"
                  name="schoolDetails.principalName"
                  placeholder="Name as in National ID"
                  value={updatedUserInfo.schoolDetails.principalName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="schoolType" className="form-label">
                  School Type
                </label>
                <select
                  className="form-control"
                  id="schoolType"
                  name="schoolDetails.schoolType"
                  value={updatedUserInfo.schoolDetails.schoolType || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select School Type</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="numStudents" className="form-label">
                  Number of Students
                </label>
                <select
                  id="numStudents"
                  name="schoolDetails.numStudents"
                  className="form-control"
                  value={updatedUserInfo.schoolDetails.numStudents}
                  onChange={handleChange}
                  required
                >
                  <option value="50-100">50 - 100</option>
                  <option value="101-200">101 - 200</option>
                  <option value="201-500">201 - 500</option>
                  <option value="501-1000">501 - 1,000</option>
                  <option value="1001-2000">1,001 - 2,000</option>
                  <option value="2001-5000">2,001 - 5,000</option>
                </select>
              </div>
              <div className="mb-3 row align-items-center">
                <label
                  htmlFor="accreditation"
                  className="col-sm-4 col-form-label mb-0"
                >
                  Accreditation
                </label>
                <div className="col-sm-8">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="accreditation"
                    name="schoolDetails.accreditation"
                    checked={
                      updatedUserInfo.schoolDetails.accreditation || false
                    }
                    onChange={handleChange}
                    style={{ transform: "scale(1.5)", marginLeft: "0.5rem" }}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="website" className="form-label">
                  Website
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="website"
                  name="schoolDetails.website"
                  placeholder="Provide link if available"
                  value={updatedUserInfo.schoolDetails.website}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="missionStatement" className="form-label">
                  Mission Statement
                </label>
                <textarea
                  className="form-control"
                  id="missionStatement"
                  name="schoolDetails.missionStatement"
                  value={updatedUserInfo.schoolDetails.missionStatement}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="contactNumber" className="form-label">
                  Contact Number
                </label>
                <textarea
                  type="text"
                  className="form-control"
                  id="contactNumber"
                  name="schoolDetails.contactNumber"
                  placeholder="Start with +254"
                  value={updatedUserInfo.schoolDetails.contactNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          {userInfo.role === "donor" && (
            <>
              <div className="mb-3">
                <label htmlFor="contactNumber" className="form-label">
                  Contact Number
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="contactNumber"
                  name="donorDetails.contactNumber"
                  value={updatedUserInfo.donorDetails.contactNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="donorType" className="form-label">
                  Donor Type
                </label>
                <select
                  id="donorType"
                  name="donorDetails.donorType"
                  className="form-control"
                  value={updatedUserInfo.donorDetails.donorType}
                  onChange={handleChange}
                  required
                >
                  <option value="NGO">NGO</option>
                  <option value="Government">Government</option>
                  <option value="Individual">Individual</option>
                  <option value="Corporate">Corporate</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="organizationName" className="form-label">
                  Organization Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="organizationName"
                  name="donorDetails.organizationName"
                  value={updatedUserInfo.donorDetails.organizationName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="registrationNumber" className="form-label">
                  Registration Number
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="registrationNumber"
                  name="donorDetails.registrationNumber"
                  value={updatedUserInfo.donorDetails.registrationNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3 row align-items-center">
                <label
                  htmlFor="taxExemptStatus"
                  className="col-sm-4 col-form-label"
                >
                  Tax Exempt Status
                </label>
                <div className="col-sm-8">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="taxExemptStatus"
                    name="donorDetails.taxExemptStatus"
                    checked={updatedUserInfo.donorDetails.taxExemptStatus}
                    onChange={handleChange}
                    style={{ transform: "scale(1.5)" }} // Increase size of checkbox
                  />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="occupation" className="form-label">
                  Occupation
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="occupation"
                  name="donorDetails.occupation"
                  value={updatedUserInfo.donorDetails.occupation}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Donation Categories</label>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="donationBooks"
                    name="donorDetails.donationCategories"
                    value="Books"
                    checked={updatedUserInfo.donorDetails.donationCategories.includes(
                      "Books"
                    )}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="donationBooks">
                    Books
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="donationUniforms"
                    name="donorDetails.donationCategories"
                    value="Uniforms"
                    checked={updatedUserInfo.donorDetails.donationCategories.includes(
                      "Uniforms"
                    )}
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="donationUniforms"
                  >
                    Uniforms
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="donationMoney"
                    name="donorDetails.donationCategories"
                    value="Money"
                    checked={updatedUserInfo.donorDetails.donationCategories.includes(
                      "Money"
                    )}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="donationMoney">
                    Money
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="donationFood"
                    name="donorDetails.donationCategories"
                    value="Food"
                    checked={updatedUserInfo.donorDetails.donationCategories.includes(
                      "Food"
                    )}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="donationFood">
                    Food
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="donationOther"
                    name="donorDetails.donationCategories"
                    value="Other"
                    checked={updatedUserInfo.donorDetails.donationCategories.includes(
                      "Other"
                    )}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="donationOther">
                    Other
                  </label>
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="annualBudget" className="form-label">
                  Annual Budget
                </label>
                <select
                  id="annualBudget"
                  name="donorDetails.annualBudget"
                  className="form-control"
                  value={updatedUserInfo.donorDetails.annualBudget}
                  onChange={handleChange}
                  required
                >
                  <option value="200-500">$200 - $500</option>
                  <option value="501-1000">$501 - $1,000</option>
                  <option value="1001-5000">$1,001 - $5,000</option>
                  <option value="5001-10000">$5,001 - $10,000</option>
                  <option value="10001-50000">$10,001 - $50,000</option>
                  <option value="50001-100000">$50,001 - $100,000</option>
                  <option value="100001-500000">$100,001 - $500,000</option>
                  <option value="500001-1000000">$500,001 - $1,000,000</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="donationFrequency" className="form-label">
                  Donation Frequency
                </label>
                <select
                  id="donationFrequency"
                  name="donorDetails.donationFrequency"
                  className="form-control"
                  value={updatedUserInfo.donorDetails.donationFrequency}
                  onChange={handleChange}
                  required
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annually">Annually</option>
                  <option value="No Specific Duration">
                    No Specific Duration
                  </option>
                </select>
              </div>
              {donorType !== "Individual" && (
                <div className="mb-3">
                  <label
                    htmlFor="organizationAffiliation"
                    className="form-label"
                  >
                    Organization Affiliation
                  </label>
                  <select
                    id="organizationAffiliation"
                    name="donorDetails.organizationAffiliation"
                    className="form-control"
                    value={updatedUserInfo.donorDetails.organizationAffiliation}
                    onChange={handleChange}
                  >
                    <option value="">Select Organization Affiliation</option>
                    <option value="NGO">NGO</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Government">Government</option>
                  </select>
                </div>
              )}
            </>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ backgroundColor: "#ffc107", borderColor: "#ffc107" }}
          >
            Save Changes
          </button>
        </form>
      ) : (
        <div>
          <p>
            <strong>Name:</strong> {userInfo.name}
          </p>
          <p>
            <strong>Email:</strong> {userInfo.email}
          </p>
          {userInfo.role === "school" && (
            <>
              <p>
                <strong>School Name:</strong>{" "}
                {userInfo.schoolDetails.schoolName}
              </p>
              <p>
                <strong>Location:</strong> {userInfo.schoolDetails.location}
              </p>
              <p>
                <strong>Needs:</strong>{" "}
                {userInfo.schoolDetails.needs.join(", ")}
              </p>
              <p>
                <strong>Principal Name:</strong>{" "}
                {userInfo.schoolDetails.principalName}
              </p>
              <p>
                <strong>School Type:</strong>{" "}
                {userInfo.schoolDetails.schoolType}
              </p>
              <p>
                <strong>Number of Students:</strong>{" "}
                {userInfo.schoolDetails.numStudents}
              </p>
              <p>
                <strong>Accreditation:</strong>{" "}
                {userInfo.schoolDetails.accreditation ? "Yes" : "No"}
              </p>
              <p>
                <strong>Website:</strong> {userInfo.schoolDetails.website}
              </p>
              <p>
                <strong>Mission Statement:</strong>{" "}
                {userInfo.schoolDetails.missionStatement}
              </p>
              <p>
                <strong>Contact Number:</strong>{" "}
                {userInfo.schoolDetails.contactNumber}
              </p>
            </>
          )}
          {userInfo.role === "donor" && (
            <>
              <p>
                <strong>Contact Number:</strong>{" "}
                {userInfo.donorDetails.contactNumber}
              </p>
              <p>
                <strong>Donor Type:</strong> {userInfo.donorDetails.donorType}
              </p>
              <p>
                <strong>Organization Name:</strong>{" "}
                {userInfo.donorDetails.organizationName}
              </p>
              <p>
                <strong>Registration Number:</strong>{" "}
                {userInfo.donorDetails.registrationNumber}
              </p>
              <p>
                <strong>Tax Exempt Status:</strong>{" "}
                {userInfo.donorDetails.taxExemptStatus ? "Yes" : "No"}
              </p>
              <p>
                <strong>Occupation:</strong> {userInfo.donorDetails.occupation}
              </p>
              <p>
                <strong>Donation Categories:</strong>{" "}
                {userInfo.donorDetails.donationCategories.join(", ")}
              </p>
              <p>
                <strong>Annual Budget:</strong>{" "}
                {userInfo.donorDetails.annualBudget}
              </p>
              <p>
                <strong>Donation Frequency:</strong>{" "}
                {userInfo.donorDetails.donationFrequency}
              </p>
              {donorType !== "Individual" && (
                <p>
                  <strong>Organization Affiliation:</strong>{" "}
                  {userInfo.donorDetails.organizationAffiliation}
                </p>
              )}
            </>
          )}
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-secondary mt-3"
            style={{ backgroundColor: "#ffc107", borderColor: "#ffc107" }}
          >
            Update Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
