import React, { useState } from "react";
import { Button, Card, Form, Row, Col, Spinner, Table } from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../config";
import { saveAs } from "file-saver";
import { useTheme } from "../contexts/ThemeContext";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
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

  // Get a friendly date string for file naming
  const getFormattedDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };

  // Generate unique file names for different report types
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

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/admin/reports`,
        {
          reportType,
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString(),
          format: format,
          status: filterStatus !== "All" ? filterStatus : undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "arraybuffer",
        }
      );

      const contentType =
        format === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      const fileName = getReportFileName(reportType, format);

      const blob = new Blob([response.data], { type: contentType });
      saveAs(blob, fileName);
    } catch (error) {
      console.error("Error generating report:", error);
      showError(
        "Report Generation Failed",
        error.response?.data?.message ||
          "Failed to generate report. Please try again later."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Get report title based on report type
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

  // Generate PDF report with proper tables
  const generatePDFReport = async () => {
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
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data;
      const doc = new jsPDF();

      // Get dynamic title based on report type
      const reportTitle = getReportTitle(reportType);

      // Add header with dynamic title
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text(reportTitle, 105, 15, { align: "center" });

      // Report details
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(
        `From ${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}`,
        105,
        22,
        { align: "center" }
      );

      if (filterStatus !== "All") {
        doc.text(`Status Filter: ${filterStatus}`, 105, 29, {
          align: "center",
        });
      }

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);

      // Prepare table data based on report type
      let headers = [];
      let rows = [];

      switch (reportType) {
        case "donations":
          headers = [
            "#",
            "Donor",
            "School",
            "Type",
            "Details",
            "Status",
            "Date",
          ];
          rows = data.map((item, index) => [
            index + 1,
            item.donorName || "Anonymous",
            item.schoolName || "N/A",
            item.type || "Unknown",
            item.type === "money"
              ? `KES ${item.amount || 0}`
              : item.items?.join(", ") || "N/A",
            item.status || "N/A",
            new Date(item.date).toLocaleDateString(),
          ]);
          break;
        case "donors":
          headers = [
            "#",
            "Name",
            "Email",
            "Type",
            "Total Donations",
            "Last Donation",
          ];
          rows = data.map((item, index) => [
            index + 1,
            item.name || "Unknown",
            item.email || "N/A",
            item.donorType || "Individual",
            item.totalDonations || 0,
            item.lastDonation
              ? new Date(item.lastDonation).toLocaleDateString()
              : "N/A",
          ]);
          break;
        case "schools":
          headers = [
            "#",
            "School",
            "Location",
            "Total Donations",
            "Pending Requests",
            "Last Donation",
          ];
          rows = data.map((item, index) => [
            index + 1,
            item.name || "Unknown",
            item.location || "N/A",
            item.totalDonations || 0,
            item.pendingRequests || 0,
            item.lastDonation
              ? new Date(item.lastDonation).toLocaleDateString()
              : "N/A",
          ]);
          break;
        case "financial":
          // Add financial summary section
          doc.setFontSize(12);
          doc.setTextColor(50, 50, 50);
          doc.text("Financial Overview", 14, 45);

          const summaryTable = [
            [
              "Total Amount",
              `KES ${data.summary.totalAmount.toLocaleString() || 0}`,
            ],
            [
              "Average Donation",
              `KES ${data.summary.averageDonation.toLocaleString() || 0}`,
            ],
          ];

          doc.autoTable({
            startY: 50,
            head: [["Metric", "Value"]],
            body: summaryTable,
            theme: "grid",
            headStyles: {
              fillColor: darkMode ? [51, 51, 51] : [41, 128, 185],
              textColor: 255,
              fontStyle: "bold",
            },
          });

          // Add school breakdown if available
          if (
            data.summary.bySchool &&
            Object.keys(data.summary.bySchool).length > 0
          ) {
            const schoolRows = Object.entries(data.summary.bySchool).map(
              ([school, amount]) => [school, `KES ${amount.toLocaleString()}`]
            );

            doc.autoTable({
              startY: doc.previousAutoTable.finalY + 10,
              head: [["School", "Total Amount"]],
              body: schoolRows,
              theme: "grid",
              headStyles: {
                fillColor: darkMode ? [51, 51, 51] : [41, 128, 185],
                textColor: 255,
                fontStyle: "bold",
              },
            });
          }

          // Add donations details
          headers = ["#", "Donor", "School", "Amount", "Date"];
          rows = data.donations.map((item, index) => [
            index + 1,
            item.donorName || "Anonymous",
            item.schoolName || "N/A",
            `KES ${item.amount || 0}`,
            new Date(item.date).toLocaleDateString(),
          ]);

          doc.setFontSize(12);
          doc.text("Donation Details", 14, doc.previousAutoTable.finalY + 15);
          break;
        case "activity":
          // Add activity summary section
          doc.setFontSize(12);
          doc.setTextColor(50, 50, 50);
          doc.text("Activity Summary", 14, 45);

          const activitySummary = [
            ["New Users", data.newUsers || 0],
            ["New Donations", data.newDonations || 0],
            ["New Requests", data.newRequests || 0],
          ];

          doc.autoTable({
            startY: 50,
            head: [["Metric", "Count"]],
            body: activitySummary,
            theme: "grid",
            headStyles: {
              fillColor: darkMode ? [51, 51, 51] : [41, 128, 185],
              textColor: 255,
              fontStyle: "bold",
            },
          });

          headers = ["#", "Name", "Role", "Last Active"];
          rows = data.userActivity.map((item, index) => [
            index + 1,
            item.name || "Unknown",
            item.role || "User",
            new Date(item.lastActive).toLocaleString(),
          ]);

          doc.setFontSize(12);
          doc.text(
            "User Activity Details",
            14,
            doc.previousAutoTable.finalY + 15
          );
          break;
        case "users":
          headers = [
            "#",
            "Name",
            "Email",
            "Role",
            "Registered",
            "Last Login",
            "Status",
          ];
          rows = data.map((item, index) => [
            index + 1,
            item.name || "Unknown",
            item.email || "N/A",
            item.role || "User",
            new Date(item.createdAt).toLocaleDateString(),
            item.lastLogin
              ? new Date(item.lastLogin).toLocaleDateString()
              : "N/A",
            item.status || "Active",
          ]);
          break;
        default:
          headers = ["#", "Data"];
          rows = data.map((item, index) => [index + 1, JSON.stringify(item)]);
      }

      // Add main table with consistent styling
      const startY =
        reportType === "financial" || reportType === "activity"
          ? doc.previousAutoTable.finalY + 20
          : 45;

      doc.autoTable({
        startY: startY,
        head: [headers],
        body: rows,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: darkMode ? [51, 51, 51] : [41, 128, 185],
          textColor: 255,
          fontSize: 9,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: darkMode ? [68, 68, 68] : [245, 245, 245],
          textColor: darkMode ? 255 : 0,
        },
        theme: "grid",
        margin: { top: 50 },
      });

      // Add footer
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        "© 2025 School Donation Management System - Confidential Report",
        105,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );

      // Save with unique name
      const fileName = getReportFileName(reportType, "pdf");
      doc.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      showError(
        "PDF Generation Failed",
        error.response?.data?.message ||
          "Failed to generate PDF report. Please try again later."
      );
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

            <Button
              variant="primary"
              onClick={format === "pdf" ? generatePDFReport : generateReport}
              disabled={isGenerating}
              className="mt-3"
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
                setFormat("pdf"); // Set to PDF for quick reports
                generatePDFReport(); // Auto-generate report
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
