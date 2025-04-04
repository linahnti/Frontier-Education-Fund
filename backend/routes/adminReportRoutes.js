const express = require("express");
const router = express.Router();
const { generateReport } = require("../controllers/adminReportController");
const authMiddleware = require("../middleware/authMiddleware");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/", protect, admin, generateReport);

module.exports = router;
