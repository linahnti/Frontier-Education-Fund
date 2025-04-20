require("dotenv").config();
const { StatusCodes } = require("http-status-codes");
const paystackApi = require("../api/paystackApi");
const { Donation } = require("../models/donation");
const { BadRequestError } = require("../utils/apiError");
const { asyncWrapper } = require("../utils/asyncWrapper");

class PaystackController {
  initializePayment = asyncWrapper(async (req, res) => {
    const { amount, email, callbackUrl, name, donorId, schoolId, type } =
      req.body;

    // Validate required fields
    if (!amount || !email || !name || !donorId || !schoolId || !type) {
      throw new BadRequestError("Missing required payment details");
    }

    // Validate amount is a number
    if (isNaN(amount)) {
      throw new BadRequestError("Invalid amount format");
    }

    const paymentDetails = {
      amount: Math.round(amount * 100), // Convert to kobo
      email,
      callback_url: callbackUrl,
      metadata: {
        name,
        email,
        amount,
        donorId,
        schoolId,
        type,
      },
    };

    try {
      // Initialize payment with Paystack
      const paystackResponse = await paystackApi.initializePayment(
        paymentDetails
      );

      // Create donation record
      const donation = await Donation.create({
        name,
        email,
        amount,
        donorId,
        schoolId,
        type,
        status: "pending",
        paymentReference: paystackResponse.reference,
      });

      res.status(StatusCodes.OK).json({
        status: "success",
        message: "Payment initialized successfully",
        data: {
          authorizationUrl: paystackResponse.authorizationUrl,
          reference: paystackResponse.reference,
          donationId: donation._id,
        },
      });
    } catch (error) {
      console.error("Payment initialization error:", error);
      throw new BadRequestError("Failed to initialize payment");
    }
  });

  verifyPayment = asyncWrapper(async (req, res) => {
    const reference = req.query.reference;
    if (!reference) {
      throw new BadRequestError("Missing transaction reference");
    }

    const verification = await paystackApi.verifyPayment(reference);
    const { data: paymentData } = verification;

    if (paymentData.status !== "success") {
      throw new BadRequestError(
        `Payment failed: ${paymentData.gateway_response}`
      );
    }

    const { metadata } = paymentData;
    const donation = await Donation.findOneAndUpdate(
      { paymentReference: reference },
      {
        status: "completed",
        verifiedAt: new Date(),
        paymentData: {
          channel: paymentData.channel,
          currency: paymentData.currency,
          fees: paymentData.fees,
        },
      },
      { new: true }
    );

    if (!donation) {
      throw new BadRequestError("Donation record not found");
    }

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Payment verified",
      data: {
        reference,
        amount: metadata.amount,
        donorId: metadata.donorId,
        schoolId: metadata.schoolId,
        type: metadata.type,
        date: new Date(),
      },
    });
  });
}

module.exports = new PaystackController();
