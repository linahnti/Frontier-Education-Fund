import React, { useState, useEffect } from "react";
import { Button, Table } from "react-bootstrap";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "../styles/ReportsTab.css";

const ReportsTab = ({ userId, role }) => {
  const [data, setData] = useState([]);
  const [requests, setRequests] = useState([]); // Initialize as empty array

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        const endpoint =
          role === "Donor"
            ? `http://localhost:5000/api/donors/${userId}/reports`
            : `http://localhost:5000/api/schools/${userId}/reports`;

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }

        const result = await response.json();
        setData(result.donations || []); // Ensure data is an array
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    const fetchDonationRequests = async () => {
      if (role === "School") {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `http://localhost:5000/api/schools/${userId}/donation-requests`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch donation requests");
          }

          const result = await response.json();
          setRequests(result.requests || []); // Ensure requests is an array
        } catch (error) {
          console.error("Error fetching donation requests:", error);
        }
      }
    };

    fetchReports();
    fetchDonationRequests();
  }, [userId, role]);

  // Filter data based on status
  const filterDataByStatus = (status) => {
    return data.filter((item) => item.status === status);
  };

  // Generate PDF for a specific table
  const downloadPDF = (status) => {
    const filteredData = filterDataByStatus(status);

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text(`${role} ${status} Donation Report`, 10, 10);

    // Prepare data for the table
    const columns = [
      { title: "School Name", dataKey: "schoolName" },
      { title: "Donor Name", dataKey: "donorName" },
      { title: "Type", dataKey: "type" },
      { title: "Amount/Items", dataKey: "amountItems" },
      { title: "Status", dataKey: "status" },
      { title: "Date", dataKey: "date" },
    ];

    const rows = filteredData.map((item) => ({
      schoolName: item.schoolName || "N/A",
      donorName: item.donorName || "N/A",
      type: item.type,
      amountItems:
        item.type === "money"
          ? `KES ${item.amount || 0}`
          : item.items?.join(", ") || "N/A",
      status: item.status,
      date: new Date(item.date).toLocaleDateString(),
    }));

    // Add table to PDF
    doc.autoTable({
      head: [columns.map((col) => col.title)],
      body: rows.map((row) => columns.map((col) => row[col.dataKey])),
      startY: 20,
    });

    // Save the PDF
    doc.save(`${role}_${status}_Donation_Report.pdf`);
  };

  // Render table for a specific status
  const renderTable = (status) => {
    const filteredData = filterDataByStatus(status);

    return (
      <div className="mt-4">
        <h4>{status} Donations</h4>
        <Table striped bordered hover>
          <thead>
            <tr>
              {role === "Donor" ? (
                <>
                  <th>School Name</th>
                  <th>Type</th>
                  <th>Amount/Items</th>
                  <th>Status</th>
                  <th>Date</th>
                </>
              ) : (
                <>
                  <th>Donor Name</th>
                  <th>Item</th>
                  <th>Status</th>
                  <th>Date</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index}>
                {role === "Donor" ? (
                  <>
                    <td>{item.schoolName || "N/A"}</td>
                    <td>{item.type}</td>
                    <td>
                      {item.type === "money"
                        ? `KES ${item.amount || 0}`
                        : item.items?.join(", ") || "N/A"}
                    </td>
                    <td>{item.status}</td>
                    <td>{new Date(item.date).toLocaleDateString()}</td>
                  </>
                ) : (
                  <>
                    <td>{item.donorName || "N/A"}</td>
                    <td>{item.item || "N/A"}</td>
                    <td>{item.status}</td>
                    <td>{new Date(item.date).toLocaleDateString()}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
        <Button variant="primary" onClick={() => downloadPDF(status)}>
          <i className="bi bi-download"></i> Download Report
        </Button>
      </div>
    );
  };

  // Render donation requests table for School Dashboard
  const renderDonationRequests = () => {
    const statuses = ["Pending", "Approved", "Completed", "Rejected"];
  
    return (
      <div className="mt-4">
        <h4>Donation Requests</h4>
        {statuses.map((status) => (
          <div key={status}>
            <h5>{status} Requests</h5>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Needs</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {requests
                  .filter((request) => request.status === status)
                  .map((request, index) => (
                    <tr key={index}>
                      <td>{request.donationNeeds?.join(", ") || "N/A"}</td>
                      <td>{request.status}</td>
                      <td>{new Date(request.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
              </tbody>
            </Table>
            <Button variant="primary" onClick={() => downloadPDF(status)}>
              <i className="bi bi-download"></i> Download Report
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      {role === "Donor" ? (
        <>
          {renderTable("Pending")}
          {renderTable("Approved")}
          {renderTable("Completed")}
        </>
      ) : (
        <>
          {renderTable("Pending")}
          {renderTable("Approved")}
          {renderTable("Received")}
          {renderDonationRequests()}
        </>
      )}
    </div>
  );
};

export default ReportsTab;
