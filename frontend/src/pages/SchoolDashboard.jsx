import React from "react";
import Navbar from "../components/Navbar";

const SchoolDashboard = () => {
  return (
    <div>
      <Navbar userRole="school" />
      <div className="container">
        <h1>Welcome to the School Dashboard</h1>
        {/* School-specific content */}
      </div>
    </div>
  );
};

export default SchoolDashboard;
