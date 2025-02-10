import React, { useEffect, useState } from "react";
import WelcomeBanner from "../components/WelcomeBanner";

const DonorDashboard = () => {
  const [donor, setDonor] = useState(null); // Initial state is null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonorData = async () => {
      const token = localStorage.getItem("token"); // Retrieve the token from localStorage

      try {
        const response = await fetch(
          "http://localhost:5000/api/donor/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the request headers
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setDonor(data); // Set the donor data
        } else {
          console.error("Failed to fetch donor data:", data.message);
          setError(data.message || "Error loading donor data");
        }
      } catch (error) {
        console.error("Error fetching donor data:", error);
        setError("An unexpected error occurred while fetching donor data");
      } finally {
        setLoading(false); // Stop the loading state
      }
    };

    fetchDonorData();
  }, []);

  if (loading) return <div>Loading...</div>; // Show loading indicator
  if (error) return <div>{error}</div>; // Show error message if an error occurs

  return (
    <div>
      <WelcomeBanner
        donor={donor}
        onProfileUpdate={() => window.location.reload()} // Refresh on profile update
      />
      <h1>Welcome, {donor?.name}!</h1>
      {/* Rest of the dashboard */}
    </div>
  );
};

export default DonorDashboard;
