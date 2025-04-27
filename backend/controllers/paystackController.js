require("dotenv").config();
const { StatusCodes } = require("http-status-codes");
const paystackApi = require("../api/paystackApi");
const { Donation } = require("../models/donation");
const User = require("../models/user");
const Donor = require("../models/donorDiscriminator");
const School = require("../models/schoolDiscriminator");
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

    try {
      const verification = await paystackApi.verifyPayment(reference);
      const { data: paymentData } = verification;

      console.log("Payment verification data:", paymentData);

      // More lenient status checking - Paystack sometimes uses different status formats
      const isSuccessful =
        paymentData.status === "success" ||
        paymentData.status === "successful" ||
        (paymentData.data && paymentData.data.status === "success");

      if (!isSuccessful) {
        throw new BadRequestError(
          `Payment failed: ${paymentData.gateway_response || "Unknown reason"}`
        );
      }

      // Get metadata from the correct location
      const metadata =
        paymentData.metadata ||
        (paymentData.data && paymentData.data.metadata) ||
        {};

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
        { new: true, upsert: false }
      );

      if (!donation) {
        console.log("Donation not found for reference:", reference);
      }

      const { donorId, schoolId, amount } = metadata;

      const donor = await User.findByIdAndUpdate(
        donorId,
        {
          $push: {
            donationsMade: {
              schoolId,
              type: "money",
              amount,
              status: "Completed",
              date: new Date(),
              approvalDate: new Date(),
              completionDate: new Date(),
            },
            notifications: {
              message: `Your donation of KES ${amount} has been successfully processed.`,
              type: "payment_success",
              date: new Date(),
              read: false,
            },
          },
        },
        { new: true }
      );

      const school = await User.findByIdAndUpdate(
        schoolId,
        {
          $push: {
            donationsReceived: {
              donorId,
              item: `KES ${amount}`,
              status: "Completed",
              date: new Date(),
              approvalDate: new Date(),
              completionDate: new Date(),
            },
            notifications: {
              message: `You have received a donation of KES ${amount}.`,
              type: "donation_received",
              date: new Date(),
              read: false,
            },
          },
        },
        { new: true }
      );

      // If using discriminators, update the specific donor and school models
      if (donor && school) {
        await Donor.findByIdAndUpdate(donorId, {
          $push: {
            donationsMade: {
              schoolId,
              type: "money",
              amount,
              status: "Completed",
              date: new Date(),
            },
          },
        });

        await School.findByIdAndUpdate(schoolId, {
          $push: {
            donationsReceived: {
              donorId,
              item: `KES ${amount}`,
              status: "Completed",
              date: new Date(),
            },
          },
        });
      }

      res.status(StatusCodes.OK).json({
        status: "success",
        message: "Payment verified successfully",
        data: {
          reference,
          amount: metadata.amount || paymentData.amount,
          donorId: metadata.donorId,
          schoolId: metadata.schoolId,
          type: metadata.type || "money",
          date: new Date(),
        },
      });
    } catch (error) {
      console.error("Payment verification error:", error);
      throw new BadRequestError("Failed to verify payment: " + error.message);
    }
  });
}

module.exports = new PaystackController();
