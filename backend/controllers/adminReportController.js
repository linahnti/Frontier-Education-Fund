const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const Donor = require("../models/donorDiscriminator");
const User = require("../models/user");
const DonationRequest = require("../models/donationRequest");

// Main report generation controller
const generateReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate, format = "pdf" } = req.body;

    let reportData;
    let fileName;

    switch (reportType) {
      case "donations":
        reportData = await generateDonationData(startDate, endDate);
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
      default:
        return res.status(400).json({ message: "Invalid report type" });
    }

    if (format === "pdf") {
      const pdfBuffer = await generatePDF(reportData, reportType);
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

// Data generation functions
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
      name: u.name,
      role: u.role,
      lastActive: u.updatedAt,
    })),
  };
};

// Report generation utilities (same as before)
const generatePDF = async (data, reportType) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    // Header
    doc
      .fontSize(20)
      .text(
        `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
        { align: "center" }
      );
    doc.moveDown();

    // Report-specific content
    switch (reportType) {
      case "donations":
        generateDonationPDF(doc, data);
        break;
      case "donors":
        generateDonorPDF(doc, data);
        break;
      case "schools":
        generateSchoolPDF(doc, data);
        break;
      case "financial":
        generateFinancialPDF(doc, data);
        break;
      case "activity":
        generateActivityPDF(doc, data);
        break;
    }

    doc.end();
  });
};

const generateDonationPDF = (doc, donations) => {
  doc.fontSize(14).text("Donation Details:", { underline: true });
  doc.moveDown(0.5);

  donations.forEach((donation, i) => {
    doc
      .fontSize(12)
      .text(
        `${i + 1}. ${donation.donorName} donated ${
          donation.type === "money"
            ? `KES ${donation.amount}`
            : donation.items.join(", ")
        } to ${donation.schoolName} on ${new Date(
          donation.date
        ).toLocaleDateString()} (Status: ${donation.status})`
      );
    doc.moveDown(0.5);
  });
};

const generateDonorPDF = (doc, donors) => {
  doc.fontSize(14).text("Donor Statistics:", { underline: true });
  doc.moveDown(0.5);

  donors.forEach((donor, i) => {
    doc
      .fontSize(12)
      .text(
        `${i + 1}. ${donor.name} (${donor.email}) - ${
          donor.totalDonations
        } donations`
      );
    doc.text(`   Type: ${donor.donorType || "Not specified"}`);
    if (donor.preferredSchools.length > 0) {
      doc.text(`   Preferred schools: ${donor.preferredSchools.join(", ")}`);
    }
    doc.moveDown(0.5);
  });
};

const generateSchoolPDF = (doc, schools) => {
  doc.fontSize(14).text("School Statistics:", { underline: true });
  doc.moveDown(0.5);

  schools.forEach((school, i) => {
    doc.fontSize(12).text(`${i + 1}. ${school.name} (${school.location})`);
    doc.text(`   Total donations received: ${school.totalDonations}`);
    doc.text(`   Pending requests: ${school.pendingRequests}`);
    doc.moveDown(0.5);
  });
};

const generateFinancialPDF = (doc, financialData) => {
  doc.fontSize(14).text("Financial Summary:", { underline: true });
  doc.moveDown(0.5);

  doc.text(
    `Total Amount: KES ${financialData.summary.totalAmount.toLocaleString()}`
  );
  doc.text(
    `Average Donation: KES ${financialData.summary.averageDonation.toLocaleString()}`
  );
  doc.moveDown();

  doc.fontSize(12).text("Breakdown by School:", { underline: true });
  doc.moveDown(0.5);

  Object.entries(financialData.summary.bySchool).forEach(
    ([school, amount], i) => {
      doc.text(`${i + 1}. ${school}: KES ${amount.toLocaleString()}`);
    }
  );
};

const generateActivityPDF = (doc, activityData) => {
  doc.fontSize(14).text("System Activity:", { underline: true });
  doc.moveDown(0.5);

  doc.text(`New Users: ${activityData.newUsers}`);
  doc.text(`New Donations: ${activityData.newDonations}`);
  doc.text(`New Requests: ${activityData.newRequests}`);
  doc.moveDown();

  if (activityData.userActivity.length > 0) {
    doc.fontSize(12).text("Recent User Activity:", { underline: true });
    doc.moveDown(0.5);

    activityData.userActivity.forEach((user, i) => {
      doc.text(
        `${i + 1}. ${user.name} (${user.role}) - Last active: ${new Date(
          user.lastActive
        ).toLocaleString()}`
      );
    });
  }
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
      data.forEach((d) =>
        worksheet.addRow({
          ...d,
          items: d.items ? d.items.join(", ") : null,
          date: new Date(d.date).toLocaleDateString(),
        })
      );
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
      data.forEach((d) =>
        worksheet.addRow({
          ...d,
          lastDonation: d.lastDonation
            ? new Date(d.lastDonation).toLocaleDateString()
            : "N/A",
          preferredSchools: d.preferredSchools.join(", "),
        })
      );
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
      data.forEach((d) =>
        worksheet.addRow({
          ...d,
          lastDonation: d.lastDonation
            ? new Date(d.lastDonation).toLocaleDateString()
            : "N/A",
        })
      );
      break;

    case "financial":
      // Summary sheet
      const summarySheet = workbook.addWorksheet("Summary");
      summarySheet.columns = [
        { header: "Metric", key: "metric", width: 25 },
        { header: "Value", key: "value", width: 20 },
      ];
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
      Object.entries(data.summary.bySchool).forEach(([school, amount]) => {
        schoolSheet.addRow({
          school,
          amount: `KES ${amount.toLocaleString()}`,
        });
      });

      // Donations sheet
      worksheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Donor", key: "donorName", width: 25 },
        { header: "School", key: "schoolName", width: 25 },
        { header: "Amount", key: "amount", width: 15 },
        { header: "Date", key: "date", width: 15 },
      ];
      data.donations.forEach((d) =>
        worksheet.addRow({
          id: d._id,
          donorName: d.donorName,
          schoolName: d.schoolName,
          amount: `KES ${d.amount}`,
          date: new Date(d.date).toLocaleDateString(),
        })
      );
      break;

    case "activity":
      worksheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Name", key: "name", width: 25 },
        { header: "Role", key: "role", width: 15 },
        { header: "Last Active", key: "lastActive", width: 20 },
      ];
      data.userActivity.forEach((u) =>
        worksheet.addRow({
          id: u.id,
          name: u.name,
          role: u.role,
          lastActive: new Date(u.lastActive).toLocaleString(),
        })
      );

      // Add summary stats
      const statsSheet = workbook.addWorksheet("Summary");
      statsSheet.columns = [
        { header: "Metric", key: "metric", width: 25 },
        { header: "Count", key: "count", width: 15 },
      ];
      statsSheet.addRow({ metric: "New Users", count: data.newUsers });
      statsSheet.addRow({ metric: "New Donations", count: data.newDonations });
      statsSheet.addRow({ metric: "New Requests", count: data.newRequests });
      break;
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

module.exports = {
  generateReport,
  generateDonationData,
  generateDonorData,
  generateSchoolData,
  generateFinancialData,
  generateActivityData,
};
