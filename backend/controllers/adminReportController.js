const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const Donor = require("../models/donorDiscriminator");
const User = require("../models/user");
const DonationRequest = require("../models/donationRequest");

// Main report generation controller
const generateReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate, format = "pdf", status } = req.body;

    let reportData;
    let fileName;

    switch (reportType) {
      case "donations":
        reportData = await generateDonationData(startDate, endDate);
        if (status) {
          reportData = reportData.filter((d) => d.status === status);
        }
        fileName = "donations-report";
        break;
      case "donors":
        reportData = await generateDonorData(startDate, endDate);
        fileName = "donors-report";
        break;
      case "schools":
        reportData = await generateSchoolData(startDate, endDate);
        fileName = "schools-report";
        break;
      case "financial":
        reportData = await generateFinancialData(startDate, endDate);
        fileName = "financial-report";
        break;
      case "activity":
        reportData = await generateActivityData(startDate, endDate);
        fileName = "activity-report";
        break;
      case "users":
        reportData = await generateUserData(startDate, endDate);
        fileName = "users-report";
        break;
      default:
        return res.status(400).json({ message: "Invalid report type" });
    }

    if (format === "pdf") {
      const pdfBuffer = await generatePDF(reportData, reportType, {
        startDate,
        endDate,
        status,
      });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}-${Date.now()}.pdf"`
      );
      res.send(pdfBuffer);
    } else {
      const excelBuffer = await generateExcel(reportData, reportType);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}-${Date.now()}.xlsx"`
      );
      res.send(excelBuffer);
    }
  } catch (error) {
    console.error("Report generation error:", error);
    res
      .status(500)
      .json({ message: "Error generating report", error: error.message });
  }
};

// Data generation functions are unchanged...
const generateDonationData = async (startDate, endDate) => {
  const donors = await Donor.find({
    "donationsMade.date": {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  }).populate("donationsMade.schoolId donationsMade.donorId");

  const donations = donors.flatMap((donor) =>
    donor.donationsMade.map((donation) => ({
      ...donation.toObject(),
      donorName: donation.donorId?.name || "Anonymous",
      schoolName: donation.schoolId?.schoolName || "N/A",
    }))
  );

  return donations.filter(
    (donation) =>
      donation.date >= new Date(startDate) && donation.date <= new Date(endDate)
  );
};

const generateDonorData = async (startDate, endDate) => {
  const donors = await Donor.find({
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
  }).populate("donationsMade.schoolId");

  return donors.map((donor) => ({
    id: donor._id,
    name: donor.name,
    email: donor.email,
    donorType: donor.donorType,
    totalDonations: donor.donationsMade.length,
    lastDonation:
      donor.donationsMade.length > 0
        ? new Date(Math.max(...donor.donationsMade.map((d) => d.date)))
        : null,
    preferredSchools: [
      ...new Set(
        donor.donationsMade.map((d) => d.schoolId?.schoolName).filter(Boolean)
      ),
    ],
  }));
};

const generateSchoolData = async (startDate, endDate) => {
  const schools = await User.find({
    role: "School",
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
  }).populate("donationsReceived.donorId");

  return schools.map((school) => ({
    id: school._id,
    name: school.schoolName,
    location: school.location,
    totalDonations: school.donationsReceived.length,
    pendingRequests: school.donationsReceived.filter(
      (d) => d.status === "Pending"
    ).length,
    lastDonation:
      school.donationsReceived.length > 0
        ? new Date(Math.max(...school.donationsReceived.map((d) => d.date)))
        : null,
  }));
};

const generateFinancialData = async (startDate, endDate) => {
  const donors = await Donor.find({
    "donationsMade.date": {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
    "donationsMade.type": "money",
  }).populate("donationsMade.schoolId");

  const monetaryDonations = donors.flatMap((donor) =>
    donor.donationsMade
      .filter((d) => d.type === "money")
      .map((donation) => ({
        ...donation.toObject(),
        donorName: donor.name,
        schoolName: donation.schoolId?.schoolName || "N/A",
      }))
  );

  const summary = {
    totalAmount: monetaryDonations.reduce((sum, d) => sum + (d.amount || 0), 0),
    averageDonation:
      monetaryDonations.length > 0
        ? monetaryDonations.reduce((sum, d) => sum + (d.amount || 0), 0) /
          monetaryDonations.length
        : 0,
    bySchool: {},
  };

  monetaryDonations.forEach((donation) => {
    const schoolName = donation.schoolName || "Other";
    summary.bySchool[schoolName] =
      (summary.bySchool[schoolName] || 0) + (donation.amount || 0);
  });

  return {
    donations: monetaryDonations,
    summary,
  };
};

const generateActivityData = async (startDate, endDate) => {
  const [users, donationRequests] = await Promise.all([
    User.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    }),
    DonationRequest.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    }),
  ]);

  // Get all donations within date range
  const donors = await Donor.find({
    "donationsMade.date": {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  });
  const donationCount = donors.reduce(
    (sum, donor) => sum + donor.donationsMade.length,
    0
  );

  return {
    newUsers: users.length,
    newDonations: donationCount,
    newRequests: donationRequests.length,
    userActivity: users.map((u) => ({
      id: u._id,
      name: u.name || "Unknown",
      role: u.role || "User",
      lastActive: u.updatedAt || u.createdAt,
    })),
  };
};

// Added user data generation function
const generateUserData = async (startDate, endDate) => {
  const users = await User.find({
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
  });

  return users.map((user) => ({
    id: user._id,
    name: user.name || "Unknown",
    email: user.email || "No email",
    role: user.role || "User",
    createdAt: user.createdAt,
    lastLogin: user.lastLogin || user.updatedAt || user.createdAt,
    status: user.status || "Active",
  }));
};

// New improved PDF generation function
const generatePDF = async (data, reportType, options = {}) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    // Dynamic title based on report type
    const reportTitles = {
      donations: "Donation Report",
      donors: "Donor Activity Report",
      schools: "School Requests Report",
      financial: "Financial Summary Report",
      activity: "System Activity Report",
      users: "User Management Report",
    };

    // Header with dynamic title and styling
    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .text(reportTitles[reportType] || "Report", { align: "center" });
    doc.moveDown(0.5);

    // Report date range info
    doc
      .font("Helvetica")
      .fontSize(10)
      .text(
        `Period: ${new Date(
          options.startDate
        ).toLocaleDateString()} to ${new Date(
          options.endDate
        ).toLocaleDateString()}`,
        { align: "center" }
      );

    if (options.status && options.status !== "All") {
      doc.text(`Status Filter: ${options.status}`, { align: "center" });
    }

    doc.text(`Generated on: ${new Date().toLocaleString()}`, {
      align: "right",
    });
    doc.moveDown(1);

    // Table data preparation
    let headers = [];
    let rows = [];

    switch (reportType) {
      case "donations":
        headers = ["#", "Donor", "School", "Type", "Details", "Status", "Date"];
        if (Array.isArray(data)) {
          rows = data.map((item, index) => [
            index + 1,
            item.donorName || "Anonymous",
            item.schoolName || "N/A",
            item.type || "N/A",
            item.type === "money"
              ? `KES ${item.amount || 0}`
              : item.items && Array.isArray(item.items)
              ? item.items.join(", ")
              : "N/A",
            item.status || "N/A",
            item.date ? new Date(item.date).toLocaleDateString() : "N/A",
          ]);
        }
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
        if (Array.isArray(data)) {
          rows = data.map((item, index) => [
            index + 1,
            item.name || "Unknown",
            item.email || "N/A",
            item.donorType || "N/A",
            item.totalDonations || 0,
            item.lastDonation
              ? new Date(item.lastDonation).toLocaleDateString()
              : "N/A",
          ]);
        }
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
        if (Array.isArray(data)) {
          rows = data.map((item, index) => [
            index + 1,
            item.name || "Unknown School",
            item.location || "N/A",
            item.totalDonations || 0,
            item.pendingRequests || 0,
            item.lastDonation
              ? new Date(item.lastDonation).toLocaleDateString()
              : "N/A",
          ]);
        }
        break;
      case "financial":
        headers = ["#", "Donor", "School", "Amount", "Date"];
        if (data.donations && Array.isArray(data.donations)) {
          rows = data.donations.map((item, index) => [
            index + 1,
            item.donorName || "Anonymous",
            item.schoolName || "N/A",
            `KES ${item.amount || 0}`,
            item.date ? new Date(item.date).toLocaleDateString() : "N/A",
          ]);
        }

        // Add summary section
        if (data.summary) {
          doc
            .font("Helvetica-Bold")
            .fontSize(12)
            .text("Financial Summary:", { underline: true });
          doc
            .font("Helvetica")
            .fontSize(10)
            .text(
              `Total Amount: KES ${data.summary.totalAmount.toLocaleString()}`
            )
            .text(
              `Average Donation: KES ${data.summary.averageDonation.toLocaleString()}`
            );
          doc.moveDown(0.5);
        }
        break;
      case "activity":
        headers = ["#", "Name", "Role", "Last Active"];
        if (data.userActivity && Array.isArray(data.userActivity)) {
          rows = data.userActivity.map((item, index) => [
            index + 1,
            item.name || "Unknown",
            item.role || "User",
            item.lastActive
              ? new Date(item.lastActive).toLocaleString()
              : "N/A",
          ]);
        }

        // Add summary section for activity
        doc
          .font("Helvetica-Bold")
          .fontSize(12)
          .text("Activity Summary:", { underline: true });
        doc
          .font("Helvetica")
          .fontSize(10)
          .text(`New Users: ${data.newUsers || 0}`)
          .text(`New Donations: ${data.newDonations || 0}`)
          .text(`New Requests: ${data.newRequests || 0}`);
        doc.moveDown(0.5);
        break;
      case "users":
        headers = ["#", "Name", "Email", "Role", "Registered", "Last Login"];
        if (Array.isArray(data)) {
          rows = data.map((item, index) => [
            index + 1,
            item.name || "Unknown",
            item.email || "N/A",
            item.role || "User",
            item.createdAt
              ? new Date(item.createdAt).toLocaleDateString()
              : "N/A",
            item.lastLogin
              ? new Date(item.lastLogin).toLocaleDateString()
              : "N/A",
          ]);
        }
        break;
      default:
        headers = ["#", "Data"];
        if (Array.isArray(data)) {
          rows = data.map((item, index) => [
            index + 1,
            typeof item === "object"
              ? JSON.stringify(item)
              : String(item || "N/A"),
          ]);
        }
    }

    // Create a proper table with safe value handling
    if (rows.length > 0) {
      // Calculate column widths based on content
      const pageWidth = doc.page.width - 100; // Margins on both sides
      const colWidths = [];

      // Distribute column widths
      const fixedColWidth = pageWidth / headers.length;
      for (let i = 0; i < headers.length; i++) {
        // Give more space for text columns, less for numeric
        if (i === 0) {
          // ID column
          colWidths.push(pageWidth * 0.05); // 5% width for ID column
        } else if (i === headers.length - 1 && headers[i].includes("Date")) {
          colWidths.push(pageWidth * 0.15); // 15% for date columns
        } else if (
          headers[i].includes("Email") ||
          headers[i].includes("Details")
        ) {
          colWidths.push(pageWidth * 0.2); // 20% for details/email columns
        } else {
          // Distribute remaining width evenly
          colWidths.push(fixedColWidth);
        }
      }

      // Table header
      doc.font("Helvetica-Bold");
      let y = doc.y;
      const rowHeight = 20;

      // Draw header background
      doc.fillColor("#4682B4").rect(50, y, pageWidth, rowHeight).fill();

      // Draw header text
      doc.fillColor("white");
      headers.forEach((header, i) => {
        let xPos = 50 + colWidths.slice(0, i).reduce((sum, w) => sum + w, 0);
        doc.text(
          header,
          xPos + 5, // Add padding
          y + 5, // Add padding
          { width: colWidths[i] - 10, align: "left" } // Adjust width for padding
        );
      });

      // Table rows
      doc.font("Helvetica");
      doc.fillColor("black");

      rows.forEach((row, rowIndex) => {
        y += rowHeight;

        // Alternate row background color
        if (rowIndex % 2 === 0) {
          doc.fillColor("#f5f5f5").rect(50, y, pageWidth, rowHeight).fill();
        }

        // Draw cell text
        doc.fillColor("black");
        row.forEach((cell, colIndex) => {
          // Handle null cells safely
          const safeCell =
            cell !== null && cell !== undefined ? String(cell) : "N/A";

          let xPos =
            50 + colWidths.slice(0, colIndex).reduce((sum, w) => sum + w, 0);
          doc.text(
            safeCell,
            xPos + 5, // Add padding
            y + 5, // Add padding
            { width: colWidths[colIndex] - 10, align: "left" } // Adjust width for padding
          );
        });
      });

      // Draw table border
      doc
        .rect(
          50,
          doc.y - rows.length * rowHeight,
          pageWidth,
          rows.length * rowHeight
        )
        .stroke();
    } else {
      doc
        .font("Helvetica-Oblique")
        .text("No data available for this report.", { align: "center" });
    }

    // Add footer
    doc
      .font("Helvetica")
      .fontSize(8)
      .text(
        "© 2025 School Donation Management System - Confidential Report",
        50,
        doc.page.height - 50,
        { width: doc.page.width - 100, align: "center" }
      );

    doc.end();
  });
};

const generateExcel = async (data, reportType) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Report");

  switch (reportType) {
    case "donations":
      worksheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Donor", key: "donorName", width: 25 },
        { header: "School", key: "schoolName", width: 25 },
        { header: "Type", key: "type", width: 15 },
        { header: "Amount", key: "amount", width: 15 },
        { header: "Items", key: "items", width: 30 },
        { header: "Status", key: "status", width: 15 },
        { header: "Date", key: "date", width: 15 },
      ];

      if (Array.isArray(data)) {
        data.forEach((d) =>
          worksheet.addRow({
            ...d,
            items:
              d.items && Array.isArray(d.items) ? d.items.join(", ") : null,
            date: d.date ? new Date(d.date).toLocaleDateString() : "N/A",
          })
        );
      }
      break;

    case "donors":
      worksheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Name", key: "name", width: 25 },
        { header: "Email", key: "email", width: 30 },
        { header: "Type", key: "donorType", width: 20 },
        { header: "Total Donations", key: "totalDonations", width: 15 },
        { header: "Last Donation", key: "lastDonation", width: 15 },
        { header: "Preferred Schools", key: "preferredSchools", width: 40 },
      ];

      if (Array.isArray(data)) {
        data.forEach((d) =>
          worksheet.addRow({
            ...d,
            lastDonation: d.lastDonation
              ? new Date(d.lastDonation).toLocaleDateString()
              : "N/A",
            preferredSchools:
              d.preferredSchools && Array.isArray(d.preferredSchools)
                ? d.preferredSchools.join(", ")
                : "",
          })
        );
      }
      break;

    case "schools":
      worksheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Name", key: "name", width: 30 },
        { header: "Location", key: "location", width: 25 },
        { header: "Total Donations", key: "totalDonations", width: 15 },
        { header: "Pending Requests", key: "pendingRequests", width: 15 },
        { header: "Last Donation", key: "lastDonation", width: 15 },
      ];

      if (Array.isArray(data)) {
        data.forEach((d) =>
          worksheet.addRow({
            ...d,
            lastDonation: d.lastDonation
              ? new Date(d.lastDonation).toLocaleDateString()
              : "N/A",
          })
        );
      }
      break;

    case "financial":
      // Summary sheet
      const summarySheet = workbook.addWorksheet("Summary");
      summarySheet.columns = [
        { header: "Metric", key: "metric", width: 25 },
        { header: "Value", key: "value", width: 20 },
      ];

      if (data.summary) {
        summarySheet.addRow({
          metric: "Total Amount",
          value: `KES ${data.summary.totalAmount.toLocaleString()}`,
        });
        summarySheet.addRow({
          metric: "Average Donation",
          value: `KES ${data.summary.averageDonation.toLocaleString()}`,
        });

        // School breakdown sheet
        const schoolSheet = workbook.addWorksheet("By School");
        schoolSheet.columns = [
          { header: "School", key: "school", width: 30 },
          { header: "Amount", key: "amount", width: 20 },
        ];

        Object.entries(data.summary.bySchool || {}).forEach(
          ([school, amount]) => {
            schoolSheet.addRow({
              school,
              amount: `KES ${amount.toLocaleString()}`,
            });
          }
        );
      }

      // Donations sheet
      worksheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Donor", key: "donorName", width: 25 },
        { header: "School", key: "schoolName", width: 25 },
        { header: "Amount", key: "amount", width: 15 },
        { header: "Date", key: "date", width: 15 },
      ];

      if (data.donations && Array.isArray(data.donations)) {
        data.donations.forEach((d) =>
          worksheet.addRow({
            id: d._id,
            donorName: d.donorName || "Anonymous",
            schoolName: d.schoolName || "N/A",
            amount: `KES ${d.amount || 0}`,
            date: d.date ? new Date(d.date).toLocaleDateString() : "N/A",
          })
        );
      }
      break;

    case "activity":
      worksheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Name", key: "name", width: 25 },
        { header: "Role", key: "role", width: 15 },
        { header: "Last Active", key: "lastActive", width: 20 },
      ];

      if (data.userActivity && Array.isArray(data.userActivity)) {
        data.userActivity.forEach((u) =>
          worksheet.addRow({
            id: u.id,
            name: u.name || "Unknown",
            role: u.role || "User",
            lastActive: u.lastActive
              ? new Date(u.lastActive).toLocaleString()
              : "N/A",
          })
        );
      }

      // Add summary stats
      const statsSheet = workbook.addWorksheet("Summary");
      statsSheet.columns = [
        { header: "Metric", key: "metric", width: 25 },
        { header: "Count", key: "count", width: 15 },
      ];
      statsSheet.addRow({ metric: "New Users", count: data.newUsers || 0 });
      statsSheet.addRow({
        metric: "New Donations",
        count: data.newDonations || 0,
      });
      statsSheet.addRow({
        metric: "New Requests",
        count: data.newRequests || 0,
      });
      break;

    case "users":
      worksheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Name", key: "name", width: 25 },
        { header: "Email", key: "email", width: 30 },
        { header: "Role", key: "role", width: 15 },
        { header: "Registration Date", key: "createdAt", width: 20 },
        { header: "Last Login", key: "lastLogin", width: 20 },
        { header: "Status", key: "status", width: 15 },
      ];

      if (Array.isArray(data)) {
        data.forEach((u) =>
          worksheet.addRow({
            id: u.id,
            name: u.name || "Unknown",
            email: u.email || "N/A",
            role: u.role || "User",
            createdAt: u.createdAt
              ? new Date(u.createdAt).toLocaleDateString()
              : "N/A",
            lastLogin: u.lastLogin
              ? new Date(u.lastLogin).toLocaleDateString()
              : "N/A",
            status: u.status || "Active",
          })
        );
      }
      break;
  }

  // Style the header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "4682B4" },
  };
  worksheet.getRow(1).font = { color: { argb: "FFFFFF" } };

  // Autofit columns
  worksheet.columns.forEach((column) => {
    const maxLength = worksheet
      .getColumn(column.key)
      .values.filter((value) => value !== null)
      .map((value) => String(value).length)
      .reduce((max, length) => Math.max(max, length), column.header.length);
    column.width = Math.min(maxLength + 2, 50); // Cap at 50
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

const getReportData = async (req, res) => {
  try {
    const { reportType, startDate, endDate, status } = req.query;

    let reportData;
    switch (reportType) {
      case "donations":
        reportData = await generateDonationData(startDate, endDate);
        if (status) {
          reportData = reportData.filter((d) => d.status === status);
        }
        break;
      case "donors":
        reportData = await generateDonorData(startDate, endDate);
        break;
      case "schools":
        reportData = await generateSchoolData(startDate, endDate);
        break;
      case "financial":
        reportData = await generateFinancialData(startDate, endDate);
        break;
      case "activity":
        reportData = await generateActivityData(startDate, endDate);
        break;
      case "users":
        reportData = await generateUserData(startDate, endDate);
        break;
      default:
        return res.status(400).json({ message: "Invalid report type" });
    }

    res.status(200).json(reportData);
  } catch (error) {
    console.error("Error fetching report data:", error);
    res
      .status(500)
      .json({ message: "Error fetching report data", error: error.message });
  }
};

module.exports = {
  generateReport,
  generateDonationData,
  generateDonorData,
  generateSchoolData,
  generateFinancialData,
  generateActivityData,
  getReportData,
};
