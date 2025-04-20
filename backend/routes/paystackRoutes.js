const express = require("express");
const paystackController = require("../controllers/paystackController");
const paystackRouter = express.Router();

paystackRouter.post("/initialize", paystackController.initializePayment);
paystackRouter.get("/verify", paystackController.verifyPayment);

module.exports = paystackRouter;
