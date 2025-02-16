import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Dashboard = () => {
  return (
    <div className="d-flex vh-100">
      {/* Sidebar */}
      <div className="bg-dark text-white p-3" style={{ width: "250px" }}>
        <h4 className="text-center">Dashboard</h4>
        <ul className="nav flex-column">
          <li className="nav-item">
            <a href="#" className="nav-link text-white">Home</a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link text-white">Donations</a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link text-white">Schools</a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link text-white">Settings</a>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1">
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-light shadow">
          <div className="container-fluid">
            <span className="navbar-brand">Welcome, User</span>
            <button className="btn btn-danger">Logout</button>
          </div>
        </nav>

        {/* Content Area */}
        <div className="container mt-4">
          <h2>Dashboard Overview</h2>
          <div className="row">
            <div className="col-md-4">
              <div className="card bg-primary text-white p-3 shadow">
                <h5>Total Donations</h5>
                <p>Ksh 50,000</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-success text-white p-3 shadow">
                <h5>Registered Schools</h5>
                <p>10 Schools</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-warning text-dark p-3 shadow">
                <h5>Active Donors</h5>
                <p>25 Donors</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
