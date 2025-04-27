const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const User = require("../models/user");
const Donor = mongoose.model("Donor");
const School = mongoose.model("School");

// Fixed createDonation function
exports.createDonation = async (req, res) => {
  const { donorId, schoolId, type, amount, items, preferredDate } = req.body;

  try {
    if (!donorId || !schoolId || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Additional validation
    if (type === "money" && (isNaN(amount) || amount <= 0)) {
      return res.status(400).json({
        message: "Invalid donation amount. Amount must be greater than zero.",
      });
    }

    if (type === "items") {
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res
          .status(400)
          .json({ message: "Items cannot be empty for item donations." });
      }

      if (!preferredDate || isNaN(new Date(preferredDate).getTime())) {
        return res
          .status(400)
          .json({ message: "Invalid preferred delivery date." });
      }
    }

    // Fetch donor and school
    const donor = await User.findById(donorId);
    const school = await User.findById(schoolId);

    if (!donor || donor.role !== "Donor") {
      return res
        .status(404)
        .json({ message: "Donor not found or invalid role" });
    }

    if (!school || school.role !== "School") {
      return res
        .status(404)
        .json({ message: "School not found or invalid role" });
    }

    // Set status based on donation type
    const status = type === "money" ? "Completed" : "Pending";

    // Create donation object - consistent structure for both donor and school
    const donationObj = {
      donorId,
      schoolId,
      type,
      status,
      date: new Date(),
      items: type === "items" ? items : [],
    };

    // Add type-specific properties
    if (type === "money") {
      donationObj.amount = Number(amount);
    } else if (type === "items") {
      donationObj.items = items;
      // For item donations, add delivery info
      donationObj.delivery = {
        address: school.location || "Default delivery address",
        preferredDate: new Date(preferredDate),
        status: "Not Started",
      };
    }

    // Add donation to donor
    donor.donationsMade.push({ ...donationObj });
    await donor.save();

    // Add donation to school (remove schoolId from school's copy)
    const schoolDonation = { ...donationObj };
    delete schoolDonation.schoolId; // School doesn't need its own ID in its donations

    school.donationsReceived.push(schoolDonation);
    await school.save({ validateBeforeSave: false });

    // Create notifications
    const donationMessage =
      type === "money"
        ? `You donated KES ${amount} to ${school.schoolName || school.name}`
        : `You donated items (${items.join(", ")}) to ${
            school.schoolName || school.name
          }`;

    const receiptMessage =
      type === "money"
        ? `Received KES ${amount} donation from ${donor.name}`
        : `Received items (${items.join(", ")}) donation from ${donor.name}`;

    // Add notification to donor
    donor.notifications.push({
      message: donationMessage,
      type: "donation_confirmation",
      date: new Date(),
      read: false,
      schoolId: school._id,
      schoolName: school.schoolName || school.name,
    });
    await donor.save();

    // Add notification to school
    school.notifications.push({
      message: receiptMessage,
      type: "donation_received",
      date: new Date(),
      read: false,
      donorId: donor._id,
      donorName: donor.name,
    });
    await school.save({ validateBeforeSave: false });

    console.log(
      "About to send response with donation:",
      JSON.stringify(donationObj)
    );

    res.status(201).json({
      message: "Donation created successfully",
      donation: {
        id: donationObj._id,
        type: donationObj.type,
        status: donationObj.status,
        amount: donationObj.amount,
        items: donationObj.items,
        date: donationObj.date,
      },
    });
  } catch (error) {
    console.error("Error creating donation:", error);
    res.status(500).json({
      message: "Error creating donation",
      error: error.message,
    });
  }
};
