const express = require("express");
const donorController = require("../controllers/donorController");

const router = express.Router();

router.get("/notifications", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const donorId = decoded.userId;

    const donor = await User.findById(donorId);
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    res.status(200).json({ notifications: donor.notifications });
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error });
  }
});
// Approve a donation request
router.put("/:donorId/approve-request", donorController.approveDonationRequest);

// Complete a donation
router.put("/:donorId/complete-donation", donorController.completeDonation);

// Get donor details (including donations made)
router.get("/:donorId", donorController.getDonorDetails);

module.exports = router;
