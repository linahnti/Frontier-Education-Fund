import React, { useState, useEffect } from "react";
import { Button, Table, Card, Badge } from "react-bootstrap";
import { jsPDF } from "jspdf";
import { useTheme } from "../contexts/ThemeContext";
import "../styles/ReportsTab.css";
import assets from "../assets/images/assets";
import { API_URL } from "../config";
import DonationSummaryChart from "./DonationSummaryChart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

const ReportsTab = ({ userId, role }) => {
  const { darkMode } = useTheme();
  const [data, setData] = useState([]);
  const [requests, setRequests] = useState([]);
  const [userName, setUserName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [donationFilterStatus, setDonationFilterStatus] = useState("All");
  const [requestFilterStatus, setRequestFilterStatus] = useState("All");

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      const fetchUserName = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`${API_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });

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
            ? `${API_URL}/api/donors/${userId}/reports`
            : `${API_URL}/api/schools/${userId}/reports`;

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

        if (role === "School") {
          const processedDonations = [
            ...(result.pendingDonations || []).map((item) => ({
              ...item,
              status: "Pending",
              item:
                item.type === "money"
                  ? `KES ${item.amount}`
                  : item.items && item.items.length > 0
                  ? item.items.join(", ")
                  : "No items specified",
            })),
            ...(result.receivedDonations || []).map((item) => ({
              ...item,
              status: "Received",
              item:
                item.type === "money"
                  ? `KES ${item.amount}`
                  : item.items && item.items.length > 0
                  ? item.items.join(", ")
                  : "No items specified",
            })),
          ];

          setData(processedDonations);
          setRequests([
            ...(result.pendingRequests || []).map((item) => ({
              ...item,
              status: "Pending",
            })),
            ...(result.approvedRequests || []).map((item) => ({
              ...item,
              status: "Approved",
            })),
            ...(result.completedRequests || []).map((item) => ({
              ...item,
              status: "Completed",
            })),
          ]);
        } else {
          const processedDonations = (result.donations || []).map(
            (donation) => ({
              ...donation,
              status: donation.type === "money" ? "Completed" : donation.status,
              displayValue:
                donation.type === "money"
                  ? `KES ${donation.amount}`
                  : donation.items?.join(", ") || "Items donation",
            })
          );
          setData(processedDonations);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, [userId, role]);

  const getFilteredDonations = () => {
    return data.filter((item) => {
      const statusMatch =
        donationFilterStatus === "All" || item.status === donationFilterStatus;

      const searchTermLower = searchTerm.toLowerCase();
      const searchMatch =
        searchTerm === "" ||
        (item.schoolName &&
          item.schoolName.toLowerCase().includes(searchTermLower)) ||
        (item.donorName &&
          item.donorName.toLowerCase().includes(searchTermLower)) ||
        (item.item && item.item.toLowerCase().includes(searchTermLower)) ||
        (item.status && item.status.toLowerCase().includes(searchTermLower)) ||
        (item.date &&
          new Date(item.date).toLocaleDateString().includes(searchTerm)) ||
        (item.type === "money" &&
          `KES ${item.amount || 0}`.includes(searchTerm)) ||
        (item.items &&
          item.items.join(", ").toLowerCase().includes(searchTermLower));

      return statusMatch && searchMatch;
    });
  };

  const getFilteredRequests = () => {
    return requests.filter((request) => {
      const statusMatch =
        requestFilterStatus === "All" || request.status === requestFilterStatus;

      const searchTermLower = searchTerm.toLowerCase();
      const searchMatch =
        searchTerm === "" ||
        (request.donationNeeds &&
          request.donationNeeds
            .join(", ")
            .toLowerCase()
            .includes(searchTermLower)) ||
        (request.status &&
          request.status.toLowerCase().includes(searchTermLower)) ||
        (request.date &&
          new Date(request.date).toLocaleDateString().includes(searchTerm));

      return statusMatch && searchMatch;
    });
  };

  const getReportTitle = (status, reportType) => {
    const entityType = role === "Donor" ? "Donor" : "School";
    return reportType === "donation"
      ? `${entityType} Report: ${status} Donations`
      : `${entityType} Report: ${status} Requests`;
  };

  const getReportSubtitle = (status, reportType) => {
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (reportType === "donation") {
      return role === "Donor"
        ? `Summary of ${status.toLowerCase()} donations made as of ${date}`
        : `Summary of ${status.toLowerCase()} donations received as of ${date}`;
    }
    return `Summary of ${status.toLowerCase()} donation requests as of ${date}`;
  };

  const downloadPDF = (reportName) => {
    const isDonationReport = !reportName.includes("Requests");
    const status = reportName
      .replace(" Requests", "")
      .replace(" Donations", "");
    const reportType = isDonationReport ? "donation" : "request";

    const dataToExport = isDonationReport
      ? getFilteredDonations().filter((item) => item.status === status)
      : getFilteredRequests().filter((request) => request.status === status);

    const doc = new jsPDF();

    // Add logo
    try {
      const img = new Image();
      img.src = assets.favicon;
      img.onload = () => {
        doc.addImage(img, "PNG", 14, 10, 20, 20);
        generateReportContent();
      };
      img.onerror = () => {
        console.error("Failed to load logo");
        generateReportContent();
      };
    } catch (error) {
      console.error("Error adding logo:", error);
      generateReportContent();
    }

    function generateReportContent() {
      const title = getReportTitle(status, reportType);
      const subtitle = getReportSubtitle(status, reportType);

      // Header
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

      // Table configuration
      const tableConfig = isDonationReport
        ? role === "Donor"
          ? {
              headers: ["School", "Type", "Amount/Items", "Status", "Date"],
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
            }
          : {
              headers: ["Donor", "Item", "Status", "Date"],
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
            }
        : {
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
              doc.text(
                new Date(item.date).toLocaleDateString(),
                positions[2],
                yPos
              );
            },
          };

      // Generate table
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

      // Footer
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

      doc.save(`${reportName.replace(" ", "_")}_${Date.now()}.pdf`);
    }
  };

  const renderDonationTable = (status) => {
    const filteredData = getFilteredDonations().filter(
      (item) => item.status === status
    );
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
                  <th>School</th>
                  <th>Type</th>
                  <th>Amount/Items</th>
                  <th>Status</th>
                  <th>Date</th>
                </>
              ) : (
                <>
                  <th>Donor</th>
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
                  No {status.toLowerCase()} donations found
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
                      <td>
                        <Badge
                          bg={
                            item.status === "Completed" ? "success" : "warning"
                          }
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td>{new Date(item.date).toLocaleDateString()}</td>
                    </>
                  ) : (
                    <>
                      <td>{item.donorName || "N/A"}</td>
                      <td>{item.item || "N/A"}</td>
                      <td>
                        <Badge
                          bg={
                            item.status === "Received" ? "success" : "warning"
                          }
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td>{new Date(item.date).toLocaleDateString()}</td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </Table>
        <Button
          variant="primary"
          onClick={() => downloadPDF(`${status} Donations`)}
          className="mt-2"
        >
          <FontAwesomeIcon icon={faDownload} className="me-2" />
          Download Report
        </Button>
      </div>
    );
  };

  const renderRequestTable = (status) => {
    const filteredRequests = getFilteredRequests().filter(
      (request) => request.status === status
    );
    const title = getReportTitle(status, "request");

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
              <th>Needs</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center">
                  No {status.toLowerCase()} requests found
                </td>
              </tr>
            ) : (
              filteredRequests.map((request, index) => (
                <tr key={index}>
                  <td>{request.donationNeeds?.join(", ") || "N/A"}</td>
                  <td>
                    <Badge
                      bg={
                        request.status === "Completed"
                          ? "success"
                          : request.status === "Approved"
                          ? "primary"
                          : "warning"
                      }
                    >
                      {request.status}
                    </Badge>
                  </td>
                  <td>{new Date(request.date).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
        <Button
          variant="primary"
          onClick={() => downloadPDF(`${status} Requests`)}
          className="mt-2"
        >
          <FontAwesomeIcon icon={faDownload} className="me-2" />
          Download Report
        </Button>
      </div>
    );
  };

  return (
    <div className="reports-container">
      {/* Donation Summary Chart */}
      <Card className="mb-4">
        <Card.Header>
          <h5>Donation Summary</h5>
        </Card.Header>
        <Card.Body>
          <DonationSummaryChart donations={data} />
        </Card.Body>
      </Card>

      {/* Search and Filter UI */}
      <div className="search-filter-container mb-4">
        <div className="search-container">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search by name, item, needs, amount, status, or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              backgroundColor: "white",
              color: "black",
            }}
          />
        </div>
      </div>

      {/* Donations Section */}
      <div className="donations-section mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Your {role === "Donor" ? "Donations" : "Received Donations"}</h4>
          <select
            className={`form-select status-filter ${
              darkMode ? "dark-filter" : ""
            }`}
            value={donationFilterStatus}
            onChange={(e) => setDonationFilterStatus(e.target.value)}
            style={{ width: "200px" }}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            {role === "Donor" ? (
              <option value="Completed">Completed</option>
            ) : (
              <option value="Received">Received</option>
            )}
          </select>
        </div>

        {donationFilterStatus === "All" ? (
          <>
            {renderDonationTable("Pending")}
            {role === "Donor"
              ? renderDonationTable("Completed")
              : renderDonationTable("Received")}
          </>
        ) : (
          renderDonationTable(donationFilterStatus)
        )}
      </div>

      {/* Requests Section (for Schools) */}
      {role === "School" && (
        <div className="requests-section">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Donation Requests</h4>
            <select
              className={`form-select status-filter ${
                darkMode ? "dark-filter" : ""
              }`}
              value={requestFilterStatus}
              onChange={(e) => setRequestFilterStatus(e.target.value)}
              style={{ width: "200px" }}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {requestFilterStatus === "All" ? (
            <>
              {renderRequestTable("Pending")}
              {renderRequestTable("Approved")}
              {renderRequestTable("Completed")}
            </>
          ) : (
            renderRequestTable(requestFilterStatus)
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsTab;
