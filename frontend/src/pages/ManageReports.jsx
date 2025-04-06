import React, { useState } from "react";
import { Button, Card, Form, Row, Col, Spinner, Table } from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../config";
import { saveAs } from "file-saver";
import { useTheme } from "../contexts/ThemeContext";
import { jsPDF } from "jspdf";
import AlertModal from "../components/AlertModal";
import "../App.css";

const ManageReports = () => {
  const [reportType, setReportType] = useState("donations");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date(),
  });
  const [format, setFormat] = useState("excel");
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const { darkMode } = useTheme();
  const [filterRole, setFilterRole] = useState("All");

  const reportTypes = [
    { value: "donations", label: "Donation Summary" },
    { value: "donors", label: "Donor Activity" },
    { value: "schools", label: "School Requests" },
    { value: "financial", label: "Financial Summary" },
    { value: "activity", label: "System Activity" },
    { value: "users", label: "User Reports" },
  ];

  const statusOptions = [
    { value: "All", label: "All Statuses" },
    { value: "Pending", label: "Pending" },
    { value: "Approved", label: "Approved" },
    { value: "Completed", label: "Completed" },
    { value: "Received", label: "Received" },
  ];

  const [alertModal, setAlertModal] = useState({
    show: false,
    title: "",
    message: "",
    variant: "danger",
  });

  const showError = (title, message, variant = "danger") => {
    setAlertModal({
      show: true,
      title,
      message,
      variant,
    });
  };

  const hideAlert = () => {
    setAlertModal((prev) => ({ ...prev, show: false }));
  };

  const getFormattedDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };

  const getReportFileName = (reportType, format) => {
    const dateStr = getFormattedDate();
    const timeStamp = Date.now();
    const reportNames = {
      donations: "donation-summary",
      donors: "donor-activity",
      schools: "school-requests",
      financial: "financial-summary",
      activity: "system-activity",
      users: "user-management",
    };

    const baseName = reportNames[reportType] || reportType;
    const extension = format === "pdf" ? "pdf" : "xlsx";
    return `${baseName}-${dateStr}-${timeStamp}.${extension}`;
  };

  const getReportTitle = (reportType) => {
    const titles = {
      donations: "Donations Summary Report",
      donors: "Donor Activity Analysis",
      schools: "School Requests Report",
      financial: "Financial Performance Summary",
      activity: "System Activity Log",
      users: "User Management Report",
    };

    return titles[reportType] || "Generated Report";
  };

  const generatePDFReport = async () => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/api/admin/reports`,
        {
          reportType,
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString(),
          format: "pdf",
          status: filterStatus !== "All" ? filterStatus : undefined,
          role: filterRole !== "All" ? filterRole : undefined,
          clientGenerated: false,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "arraybuffer",
        }
      );

      const fileName = getReportFileName(reportType, "pdf");
      const blob = new Blob([response.data], { type: "application/pdf" });
      saveAs(blob, fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      showError(
        "PDF Generation Failed",
        "Server-side PDF generation failed. Trying client-side generation instead..."
      );
      await generateSimplePDF();
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSimplePDF = async () => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/admin/reports/report-data`,
        {
          params: {
            reportType,
            startDate: dateRange.start.toISOString(),
            endDate: dateRange.end.toISOString(),
            status: filterStatus !== "All" ? filterStatus : undefined,
            role: filterRole !== "All" ? filterRole : undefined,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      const data = response.data;
      const doc = new jsPDF();
  
      // Set margins and page width
      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth() - 2 * margin;
      
      // Get dynamic title based on report type
      const reportTitle = getReportTitle(reportType);
  
      // Add header with dynamic title
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text(reportTitle, margin, 20);
  
      // Report details
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(
        `Period: ${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}`,
        margin,
        30
      );
  
      if (filterStatus !== "All") {
        doc.text(`Status Filter: ${filterStatus}`, margin, 35);
      }
  
      if (reportType === "users" && filterRole !== "All") {
        doc.text(`Role Filter: ${filterRole}`, margin, 40);
      }
  
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Generated on: ${new Date().toLocaleString()}`,
        doc.internal.pageSize.getWidth() - margin,
        35,
        { align: "right" }
      );
  
      // Improved table drawing function
      const drawTable = (headers, rows, startY) => {
        const columnCount = headers.length;
        let currentY = startY || 45;
  
        // Calculate column widths based on content
        const colWidths = headers.map((header, index) => {
          // Fixed widths for certain columns
          if (header === "#") return 10;
          if (header === "Date" || header === "Status") return 25;
          if (header === "Type") return 20;
          
          // Calculate remaining width for other columns
          const fixedWidths = 10 + 25 + 25 + 20; // Sum of fixed widths
          const remainingWidth = pageWidth - fixedWidths;
          const remainingCols = columnCount - 4; // Number of flexible columns
          
          // Distribute remaining width (give more to Details/Description columns)
          if (header === "Details" || header === "Description") {
            return remainingWidth * 0.5;
          }
          return remainingWidth * 0.5 / (remainingCols - 1);
        });
  
        // Draw header row
        doc.setFillColor(70, 130, 180); // Steel blue background
        doc.setTextColor(255, 255, 255); // White text
        doc.setFont("helvetica", "bold");
        
        let xPos = margin;
        headers.forEach((header, index) => {
          doc.rect(xPos, currentY, colWidths[index], 10, "F");
          doc.text(
            header,
            xPos + 2,
            currentY + 7,
            { maxWidth: colWidths[index] - 4 }
          );
          xPos += colWidths[index];
        });
        currentY += 10;
  
        // Draw data rows
        doc.setFillColor(255, 255, 255);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
  
        rows.forEach((row, rowIndex) => {
          // Alternate row colors for better readability
          if (rowIndex % 2 === 0) {
            doc.setFillColor(245, 245, 245); // Light gray
          } else {
            doc.setFillColor(255, 255, 255); // White
          }
  
          xPos = margin;
          let maxHeight = 10; // Track the tallest cell in this row
  
          // First pass to calculate row height
          row.forEach((cell, colIndex) => {
            const text = String(cell || "N/A");
            const textHeight = doc.getTextDimensions(text, {
              maxWidth: colWidths[colIndex] - 4
            }).h;
            if (textHeight > maxHeight) maxHeight = textHeight;
          });
  
          // Draw cell backgrounds
          doc.rect(margin, currentY, pageWidth, maxHeight, "F");
  
          // Draw cell content
          xPos = margin;
          row.forEach((cell, colIndex) => {
            const text = String(cell || "N/A");
            doc.text(
              text,
              xPos + 2,
              currentY + 7,
              { maxWidth: colWidths[colIndex] - 4 }
            );
            xPos += colWidths[colIndex];
          });
  
          currentY += maxHeight;
  
          // Add page if needed
          if (currentY > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            currentY = 20;
            
            // Redraw header on new page if needed
            if (headers.length > 0) {
              doc.setFillColor(70, 130, 180);
              doc.setTextColor(255, 255, 255);
              doc.setFont("helvetica", "bold");
              
              xPos = margin;
              headers.forEach((header, index) => {
                doc.rect(xPos, currentY, colWidths[index], 10, "F");
                doc.text(
                  header,
                  xPos + 2,
                  currentY + 7,
                  { maxWidth: colWidths[index] - 4 }
                );
                xPos += colWidths[index];
              });
              currentY += 10;
              
              doc.setFillColor(255, 255, 255);
              doc.setTextColor(0, 0, 0);
              doc.setFont("helvetica", "normal");
            }
          }
        });
  
        return currentY;
      };
  
      // Generate appropriate table based on report type
      let currentY = 45;
      switch (reportType) {
        case "donations":
          const donationHeaders = ["#", "Donor", "School", "Type", "Details", "Status", "Date"];
          const donationRows = (Array.isArray(data) ? data : []).map((donation, index) => [
            index + 1,
            donation.donorName || "Anonymous",
            donation.schoolName || "N/A",
            donation.type || "N/A",
            donation.type === "money"
              ? `KES ${donation.amount || 0}`
              : (donation.items && Array.isArray(donation.items))
                ? donation.items.join(", ")
                : "N/A",
            donation.status || "N/A",
            donation.date ? new Date(donation.date).toLocaleDateString() : "N/A"
          ]);
          currentY = drawTable(donationHeaders, donationRows, currentY);
          break;
  
        case "donors":
          const donorHeaders = ["#", "Name", "Email", "Type", "Total Donations", "Last Donation"];
          const donorRows = (Array.isArray(data) ? data : []).map((donor, index) => [
            index + 1,
            donor.name || "Unknown",
            donor.email || "N/A",
            donor.donorType || "N/A",
            donor.totalDonations || 0,
            donor.lastDonation
              ? new Date(donor.lastDonation).toLocaleDateString()
              : "N/A"
          ]);
          currentY = drawTable(donorHeaders, donorRows, currentY);
          break;
  
        case "schools":
          const schoolHeaders = ["#", "School", "Location", "Total Donations", "Pending Requests", "Last Donation"];
          const schoolRows = (Array.isArray(data) ? data : []).map((school, index) => [
            index + 1,
            school.name || "Unknown School",
            school.location || "N/A",
            school.totalDonations || 0,
            school.pendingRequests || 0,
            school.lastDonation
              ? new Date(school.lastDonation).toLocaleDateString()
              : "N/A"
          ]);
          currentY = drawTable(schoolHeaders, schoolRows, currentY);
          break;
  
        case "financial":
          // Summary section
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("Financial Summary:", margin, currentY);
          currentY += 10;
  
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(
            `Total Amount: KES ${data.summary?.totalAmount?.toLocaleString() || 0}`,
            margin + 5,
            currentY
          );
          currentY += 8;
          doc.text(
            `Average Donation: KES ${data.summary?.averageDonation?.toLocaleString() || 0}`,
            margin + 5,
            currentY
          );
          currentY += 15;
  
          // Transactions table
          const financialHeaders = ["#", "Donor", "School", "Amount", "Date"];
          const financialRows = (data.donations && Array.isArray(data.donations) ? data.donations : []).map((donation, index) => [
            index + 1,
            donation.donorName || "Anonymous",
            donation.schoolName || "N/A",
            `KES ${donation.amount || 0}`,
            donation.date ? new Date(donation.date).toLocaleDateString() : "N/A"
          ]);
          currentY = drawTable(financialHeaders, financialRows, currentY);
          break;
  
        case "activity":
          // Summary section
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("Activity Summary:", margin, currentY);
          currentY += 10;
  
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(
            `New Users: ${data.newUsers || 0}`,
            margin + 5,
            currentY
          );
          currentY += 8;
          doc.text(
            `New Donations: ${data.newDonations || 0}`,
            margin + 5,
            currentY
          );
          currentY += 8;
          doc.text(
            `New Requests: ${data.newRequests || 0}`,
            margin + 5,
            currentY
          );
          currentY += 15;
  
          // User activity table
          const activityHeaders = ["#", "Name", "Role", "Last Active"];
          const activityRows = (data.userActivity && Array.isArray(data.userActivity) ? data.userActivity : []).map((user, index) => [
            index + 1,
            user.name || "Unknown",
            user.role || "User",
            user.lastActive ? new Date(user.lastActive).toLocaleString() : "N/A"
          ]);
          currentY = drawTable(activityHeaders, activityRows, currentY);
          break;
  
        case "users":
          const userHeaders = ["#", "Name", "Email", "Role", "Registered", "Last Login", "Status"];
          const userRows = (Array.isArray(data) ? data : []).map((user, index) => [
            index + 1,
            user.name || "Unknown",
            user.email || "N/A",
            user.role || "User",
            user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A",
            user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "N/A",
            user.status || "Active"
          ]);
          currentY = drawTable(userHeaders, userRows, currentY);
          break;
  
        default:
          // Generic table for unknown report types
          const headers = ["#", "Field", "Value"];
          const rows = (Array.isArray(data) ? data : []).map((item, index) => [
            index + 1,
            "Data",
            typeof item === "object" ? JSON.stringify(item) : String(item || "N/A")
          ]);
          currentY = drawTable(headers, rows, currentY);
      }
  
      // Add footer
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        "© 2025 School Donation Management System - Confidential Report",
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
  
      // Save with unique name
      const fileName = getReportFileName(reportType, "pdf");
      doc.save(fileName);
    } catch (error) {
      console.error("Error generating simple PDF:", error);
      showError(
        "PDF Generation Failed",
        error.response?.data?.message ||
          "Failed to generate PDF report. Please try again later."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const generateExcelReport = async () => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/admin/reports`,
        {
          reportType,
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString(),
          format: "excel",
          status: filterStatus !== "All" ? filterStatus : undefined,
          role: filterRole !== "All" ? filterRole : undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "arraybuffer",
        }
      );

      const fileName = getReportFileName(reportType, "xlsx");
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, fileName);
    } catch (error) {
      console.error("Error generating Excel report:", error);
      showError(
        "Excel Generation Failed",
        error.response?.data?.message ||
          "Failed to generate Excel report. Please try again later."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateReport = () => {
    if (format === "pdf") {
      generatePDFReport();
    } else {
      generateExcelReport();
    }
  };

  return (
    <div className={`p-4 ${darkMode ? "bg-dark text-light" : ""}`}>
      <h2 className="mb-4">Generate Reports</h2>

      <Card className={`mb-4 ${darkMode ? "bg-secondary" : ""}`}>
        <Card.Body>
          <Form>
            <Row>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Report Type</Form.Label>
                  <Form.Select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className={darkMode ? "bg-dark text-light" : ""}
                  >
                    {reportTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {reportType === "users" && (
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Role</Form.Label>
                    <Form.Select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className={darkMode ? "bg-dark text-light" : ""}
                    >
                      <option value="All">All Roles</option>
                      <option value="Admin">Admin</option>
                      <option value="School">School</option>
                      <option value="Donor">Donor</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}

              <Col md={2}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={darkMode ? "bg-dark text-light" : ""}
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={2}>
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={dateRange.start.toISOString().split("T")[0]}
                    onChange={(e) =>
                      setDateRange({
                        ...dateRange,
                        start: new Date(e.target.value),
                      })
                    }
                    className={darkMode ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
              </Col>

              <Col md={2}>
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={dateRange.end.toISOString().split("T")[0]}
                    onChange={(e) =>
                      setDateRange({
                        ...dateRange,
                        end: new Date(e.target.value),
                      })
                    }
                    className={darkMode ? "bg-dark text-light" : ""}
                  />
                </Form.Group>
              </Col>

              <Col md={2}>
                <Form.Group>
                  <Form.Label>Download Format</Form.Label>
                  <Form.Select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className={darkMode ? "bg-dark text-light" : ""}
                  >
                    <option value="excel">Excel (.xlsx)</option>
                    <option value="pdf">PDF (.pdf)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex mt-3">
              <Button
                variant="primary"
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="me-2"
              >
                {isGenerating ? (
                  <>
                    <Spinner as="span" size="sm" animation="border" />
                    <span className="ms-2">Generating...</span>
                  </>
                ) : (
                  "Generate Report"
                )}
              </Button>

              {format === "pdf" && (
                <Button
                  variant="outline-secondary"
                  onClick={generateSimplePDF}
                  disabled={isGenerating}
                >
                  Generate Simple PDF
                </Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Card className={darkMode ? "bg-secondary" : ""}>
        <Card.Body>
          <h5>Quick Reports</h5>
          <div className="d-flex flex-wrap gap-2">
            <Button
              variant={darkMode ? "outline-light" : "outline-primary"}
              className="quick-report-btn"
              onClick={() => {
                setReportType("donations");
                setFilterStatus("All");
                setDateRange({
                  start: new Date(new Date().setDate(new Date().getDate() - 7)),
                  end: new Date(),
                });
                setFormat("pdf");
                generatePDFReport();
              }}
            >
              Last 7 Days Donations
            </Button>
            <Button
              variant={darkMode ? "outline-light" : "outline-success"}
              className="quick-report-btn"
              onClick={() => {
                setReportType("financial");
                setFilterStatus("All");
                setDateRange({
                  start: new Date(new Date().getFullYear(), 0, 1),
                  end: new Date(),
                });
                setFormat("pdf");
                generatePDFReport();
              }}
            >
              Year-to-Date Financials
            </Button>
            <Button
              variant={darkMode ? "outline-light" : "outline-info"}
              className="quick-report-btn"
              onClick={() => {
                setReportType("schools");
                setFilterStatus("Pending");
                setDateRange({
                  start: new Date(
                    new Date().setMonth(new Date().getMonth() - 3)
                  ),
                  end: new Date(),
                });
                setFormat("pdf");
                generatePDFReport();
              }}
            >
              Pending School Requests
            </Button>
            <Button
              variant={darkMode ? "outline-light" : "outline-warning"}
              className="quick-report-btn"
              onClick={() => {
                setReportType("users");
                setFilterStatus("All");
                setDateRange({
                  start: new Date(
                    new Date().setMonth(new Date().getMonth() - 1)
                  ),
                  end: new Date(),
                });
                setFormat("pdf");
                generatePDFReport();
              }}
            >
              Recent User Activity
            </Button>
          </div>
        </Card.Body>
      </Card>
      <AlertModal
        show={alertModal.show}
        onHide={hideAlert}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
      />
    </div>
  );
};

export default ManageReports;