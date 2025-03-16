const express = require("express");
const { createDonation } = require("../controllers/donationsController");

const router = express.Router();

router.post("/", createDonation);

module.exports = router;
