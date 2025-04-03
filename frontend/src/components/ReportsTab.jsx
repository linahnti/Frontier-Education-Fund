import React, { useState, useEffect } from "react";
import { Button, Table } from "react-bootstrap";
import { jsPDF } from "jspdf";
import { useTheme } from "../contexts/ThemeContext";
import "../styles/ReportsTab.css";
import assets from "../assets/images/assets";

const ReportsTab = ({ userId, role }) => {
  const { darkMode } = useTheme();
  const [data, setData] = useState([]);
  const [requests, setRequests] = useState([]);
  const [userName, setUserName] = useState("");
  // New state variables for search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    // Get user name from local storage
    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      // Fetch user name from API if not in localStorage
      const fetchUserName = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            "http://localhost:5000/api/users/profile",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.ok) {
            const userData = await response.json();
            setUserName(userData.name);
            localStorage.setItem("userName", userData.name);
          }
        } catch (error) {
          console.error("Error fetching user name:", error);
        }
      };

      fetchUserName();
    }

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

        // For schools, handle the structured reports data
        if (role === "School") {
          console.log("School reports data:", result);
          // Set donations data based on the different categories
          setData([
            ...result.pendingDonations.map((item) => ({
              ...item,
              status: "Pending",
            })),
            ...result.approvedDonations.map((item) => ({
              ...item,
              status: "Approved",
            })),

            ...result.receivedDonations.map((item) => ({
              ...item,
              status: "Received",
            })),
          ]);

          setRequests([
            ...result.pendingRequests.map((item) => ({
              ...item,
              status: "Pending",
            })),
            ...result.approvedRequests.map((item) => ({
              ...item,
              status: "Approved",
            })),
            ...result.completedRequests.map((item) => ({
              ...item,
              status: "Completed",
            })),
          ]);

          console.log("Processed donations:", data);
          console.log("Processed requests:", requests);
        } else {
          setData(result.donations || []);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, [userId, role]);

  // Filter function for both search and status filtering
  const getFilteredData = (dataArray, type) => {
    return dataArray.filter((item) => {
      const statusMatch =
        filterStatus === "All" || item.status === filterStatus;

      // For search term matching
      let searchMatch = true;
      if (searchTerm.trim() !== "") {
        const searchTermLower = searchTerm.toLowerCase();

        if (type === "donation") {
          searchMatch =
            (item.schoolName &&
              item.schoolName.toLowerCase().includes(searchTermLower)) ||
            (item.donorName &&
              item.donorName.toLowerCase().includes(searchTermLower)) ||
            (item.item && item.item.toLowerCase().includes(searchTermLower)) ||
            (item.status &&
              item.status.toLowerCase().includes(searchTermLower)) ||
            (item.date &&
              new Date(item.date).toLocaleDateString().includes(searchTerm)) ||
            (item.type === "money" &&
              `KES ${item.amount || 0}`.includes(searchTerm)) ||
            (item.items &&
              item.items.join(", ").toLowerCase().includes(searchTermLower));
        } else {
          searchMatch =
            item.donationNeeds?.some((need) =>
              need.toLowerCase().includes(searchTermLower)
            ) ||
            (item.status &&
              item.status.toLowerCase().includes(searchTermLower)) ||
            (item.date &&
              new Date(item.date).toLocaleDateString().includes(searchTerm));
        }
      }

      return statusMatch && searchMatch;
    });
  };

  const filterDataByStatus = (status) => {
    return getFilteredData(
      data.filter((item) => item.status === status),
      "donation"
    );
  };

  const getReportTitle = (status, reportType) => {
    const entityType = role === "Donor" ? "Donor" : "School";

    if (reportType === "donation") {
      return `${entityType} Report: ${status} Donations`;
    } else {
      // Modified to remove repetition
      return `${entityType} Report: ${status} Donation Requests`;
    }
  };

  const getReportSubtitle = (status, reportType) => {
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (reportType === "donation") {
      if (role === "Donor") {
        return `Summary of ${status.toLowerCase()} donations made as of ${date}`;
      } else {
        return `Summary of ${status.toLowerCase()} donations received as of ${date}`;
      }
    } else {
      return `Summary of ${status.toLowerCase()} donation requests as of ${date}`;
    }
  };

  const downloadPDF = (status) => {
    const isDonationReport = !status.includes("Requests");

    let dataToExport;
    let reportType = isDonationReport ? "donation" : "request";
    const requestStatus = status.split(" ")[0]; // "Pending", "Approved", or "Completed"

    if (isDonationReport) {
      dataToExport = data.filter((item) => item.status === status);
    } else {
      dataToExport = requests.filter(
        (request) => request.status === requestStatus
      );
    }

    const doc = new jsPDF();

    try {
      const img = new Image();
      img.src = assets.favicon;

      img.onload = function () {
        // Move logo to top left with more space
        doc.addImage(img, "PNG", 14, 10, 20, 20);

        completeReport();
      };

      img.onerror = function () {
        console.error("Failed to load logo");
        completeReport();
      };
    } catch (error) {
      console.error("Error adding logo:", error);
      completeReport();
    }

    function completeReport() {
      const title = getReportTitle(status, reportType);
      const subtitle = getReportSubtitle(status, reportType);

      // Move title to the right to avoid overlap with logo
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text(title, 105, 20, { align: "center" });

      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text(subtitle, 105, 28, { align: "center" });

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated by: ${userName}`, 14, 40);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 46);

      doc.setDrawColor(200, 200, 200);
      doc.line(14, 52, 196, 52);

      const tableConfig = isDonationReport
        ? getDonationTableConfig(role)
        : getRequestTableConfig();

      let yPos = 60;

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, "bold");

      tableConfig.headers.forEach((header, i) => {
        doc.text(header, tableConfig.columnPositions[i], yPos);
      });

      doc.line(14, yPos + 5, 196, yPos + 5);
      yPos += 10;

      doc.setFont(undefined, "normal");
      doc.setFontSize(10);

      if (dataToExport.length === 0) {
        doc.text("No records found", 14, yPos);
        yPos += 10;
      } else {
        dataToExport.forEach((item, index) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;

            doc.setFont(undefined, "bold");
            tableConfig.headers.forEach((header, i) => {
              doc.text(header, tableConfig.columnPositions[i], yPos);
            });
            yPos += 10;
            doc.setFont(undefined, "normal");
          }

          if (index % 2 === 0) {
            doc.setFillColor(245, 245, 245);
            doc.rect(14, yPos - 5, 182, 10, "F");
          }

          tableConfig.formatRow(doc, item, yPos, tableConfig.columnPositions);
          yPos += 10;
        });
      }

      addReportFooter(doc);

      const formattedStatus = status.replace(" ", "_");
      const fileName = isDonationReport
        ? `${role}_${formattedStatus}_Donations_${Date.now()}.pdf`
        : `School_${formattedStatus}_Requests_${Date.now()}.pdf`;

      doc.save(fileName);
    }
  };

  const getDonationTableConfig = (role) => {
    if (role === "Donor") {
      return {
        headers: ["School Name", "Type", "Amount/Items", "Status", "Date"],
        columnPositions: [14, 60, 90, 140, 170],
        formatRow: (doc, item, yPos, positions) => {
          doc.text(item.schoolName || "N/A", positions[0], yPos);
          doc.text(item.type || "N/A", positions[1], yPos);
          doc.text(
            item.type === "money"
              ? `KES ${item.amount || 0}`
              : item.items?.join(", ") || "N/A",
            positions[2],
            yPos
          );
          doc.text(item.status, positions[3], yPos);
          doc.text(
            new Date(item.date).toLocaleDateString(),
            positions[4],
            yPos
          );
        },
      };
    } else {
      return {
        headers: ["Donor Name", "Item", "Status", "Date"],
        columnPositions: [14, 70, 120, 160],
        formatRow: (doc, item, yPos, positions) => {
          doc.text(item.donorName || "N/A", positions[0], yPos);
          doc.text(item.item || "N/A", positions[1], yPos);
          doc.text(item.status, positions[2], yPos);
          doc.text(
            new Date(item.date).toLocaleDateString(),
            positions[3],
            yPos
          );
        },
      };
    }
  };

  const getRequestTableConfig = () => {
    return {
      headers: ["Needs", "Status", "Date"],
      columnPositions: [14, 120, 160],
      formatRow: (doc, item, yPos, positions) => {
        const needsText = doc.splitTextToSize(
          item.donationNeeds?.join(", ") || "N/A",
          90
        );

        doc.text(needsText[0], positions[0], yPos);

        if (needsText.length > 1) {
          for (let i = 1; i < needsText.length; i++) {
            yPos += 7;
            doc.text(needsText[i], positions[0], yPos);
          }
        }

        doc.text(item.status, positions[1], yPos);
        doc.text(new Date(item.date).toLocaleDateString(), positions[2], yPos);
      },
    };
  };

  const addReportFooter = (doc) => {
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);

    const missionText = [
      "To ensure quality education for every child by bridging the gap",
      "between donors and underprivileged schools through a transparent",
      "platform that fosters impactful change and brighter futures.",
    ];

    let missionY = 280;
    missionText.forEach((line) => {
      doc.text(line, 105, missionY, { align: "center" });
      missionY += 5;
    });

    doc.setFont(undefined, "italic");
    doc.text("© 2025 Frontier Education Fund", 105, missionY + 5, {
      align: "center",
    });
  };

  const renderTable = (status) => {
    const filteredData = filterDataByStatus(status);
    const title = getReportTitle(status, "donation");

    return (
      <div className="mt-4">
        <h4>{title}</h4>
        <Table
          striped
          bordered
          hover
          responsive
          className={darkMode ? "table-dark" : ""}
        >
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
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={role === "Donor" ? 5 : 4} className="text-center">
                  No donations found
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
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
              ))
            )}
          </tbody>
        </Table>
        <Button variant="primary" onClick={() => downloadPDF(status)}>
          <i className="bi bi-download"></i> Download Report
        </Button>
      </div>
    );
  };

  const renderDonationRequests = () => {
    const statuses = ["Pending", "Approved", "Completed"];

    return (
      <div className="mt-4">
        <h4>Donation Requests</h4>
        {statuses.map((status) => {
          const filteredRequests = getFilteredData(
            requests.filter((request) => request.status === status),
            "request"
          );
          const title = getReportTitle(status, "request");

          return (
            <div key={status} className="mb-4">
              <h5>{title}</h5>
              <Table
                striped
                bordered
                hover
                responsive
                className={darkMode ? "table-dark" : ""}
              >
                <thead>
                  <tr>
                    <th>Needs</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center">
                        No requests found
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request, index) => (
                      <tr key={index}>
                        <td>{request.donationNeeds?.join(", ") || "N/A"}</td>
                        <td>{request.status}</td>
                        <td>{new Date(request.date).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
              <Button
                variant="primary"
                onClick={() => downloadPDF(`${status} Requests`)}
              >
                <i className="bi bi-download"></i> Download Report
              </Button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="reports-container">
      {/* Search and Filter UI - Updated styling */}
      <div className="search-filter-container mb-4">
        <div className="search-container">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search by name, item, amount, status, or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              backgroundColor: "white",
              color: "black",
            }}
          />
        </div>
        <div className="filter-container">
          <select
            className={`form-select status-filter ${
              darkMode ? "dark-filter" : ""
            }`}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Completed">Completed</option>
            {role === "School" && <option value="Received">Received</option>}
          </select>
        </div>
      </div>

      {/* Conditional rendering based on filterStatus */}
      {filterStatus === "All" ? (
        <>
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
        </>
      ) : (
        <>
          {filterStatus === "Pending" && renderTable("Pending")}
          {filterStatus === "Approved" && renderTable("Approved")}
          {filterStatus === "Completed" && renderTable("Completed")}
          {filterStatus === "Received" && renderTable("Received")}
          {/* For donation requests when school */}
          {role === "School" &&
            ["Pending", "Approved", "Completed"].includes(filterStatus) && (
              <div className="mt-4">
                <h4>Donation Requests - {filterStatus}</h4>
                <Table
                  striped
                  bordered
                  hover
                  responsive
                  className={darkMode ? "table-dark" : ""}
                >
                  <thead className={darkMode ? "table-dark" : ""}>
                    <tr>
                      <th>Needs</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredData(
                      requests.filter(
                        (request) => request.status === filterStatus
                      ),
                      "request"
                    ).length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center">
                          No {filterStatus.toLowerCase()} requests found
                        </td>
                      </tr>
                    ) : (
                      getFilteredData(
                        requests.filter(
                          (request) => request.status === filterStatus
                        ),
                        "request"
                      ).map((request, index) => (
                        <tr key={index}>
                          <td>{request.donationNeeds?.join(", ") || "N/A"}</td>
                          <td>{request.status}</td>
                          <td>{new Date(request.date).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
                <Button
                  variant="primary"
                  onClick={() => downloadPDF(`${filterStatus} Requests`)}
                >
                  <i className="bi bi-download"></i> Download Report
                </Button>
              </div>
            )}
        </>
      )}
    </div>
  );
};

export default ReportsTab;
