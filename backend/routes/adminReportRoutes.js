const express = require("express");
const router = express.Router();
const { generateReport, getReportData } = require("../controllers/adminReportController");
const authMiddleware = require("../middleware/authMiddleware");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/", protect, admin, generateReport);
router.get("/report-data", protect, admin, getReportData);

module.exports = router;
