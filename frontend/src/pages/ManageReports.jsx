import React, { useState } from "react";
import { Button, Card, Form, Row, Col, Spinner, Table } from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../config";
import { saveAs } from "file-saver";
import { useTheme } from "../contexts/ThemeContext";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

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
          format,
          status: filterStatus !== "All" ? filterStatus : undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: format === "pdf" ? "blob" : "arraybuffer",
        }
      );

      if (format === "pdf") {
        // For PDF, we'll generate it client-side for better formatting
        await generatePDFReport();
      } else {
        const extension = "xlsx";
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, `${reportType}-report-${Date.now()}.${extension}`);
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert(error.response?.data?.message || "Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDFReport = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/admin/report-data?reportType=${reportType}&startDate=${dateRange.start.toISOString()}&endDate=${dateRange.end.toISOString()}&status=${filterStatus}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data;
      const doc = new jsPDF();

      // Add header
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text(`${reportType.toUpperCase()} REPORT`, 105, 15, {
        align: "center",
      });

      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text(
        `From ${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}`,
        105,
        22,
        { align: "center" }
      );

      if (filterStatus !== "All") {
        doc.text(`Status: ${filterStatus}`, 105, 29, { align: "center" });
      }

      doc.setFontSize(10);
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
            "Amount/Items",
            "Status",
            "Date",
          ];
          rows = data.map((item, index) => [
            index + 1,
            item.donorName || "Anonymous",
            item.schoolName || "N/A",
            item.type,
            item.type === "money"
              ? `KES ${item.amount}`
              : item.items?.join(", "),
            item.status,
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
            item.name,
            item.email,
            item.donorType,
            item.totalDonations,
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
            item.name,
            item.location,
            item.totalDonations,
            item.pendingRequests,
            item.lastDonation
              ? new Date(item.lastDonation).toLocaleDateString()
              : "N/A",
          ]);
          break;
        case "users":
          headers = ["#", "Name", "Email", "Role", "Last Active"];
          rows = data.map((item, index) => [
            index + 1,
            item.name,
            item.email,
            item.role,
            new Date(item.lastActive).toLocaleString(),
          ]);
          break;
        default:
          headers = ["#", "Data"];
          rows = data.map((item, index) => [index + 1, JSON.stringify(item)]);
      }

      // Add table
      doc.autoTable({
        head: [headers],
        body: rows,
        startY: 45,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 9,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });

      // Add footer
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        "© 2025 School Donation Management System - Confidential Report",
        105,
        285,
        { align: "center" }
      );

      doc.save(`${reportType}-report-${Date.now()}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
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
              onClick={generateReport}
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
              }}
            >
              Recent User Activity
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ManageReports;
