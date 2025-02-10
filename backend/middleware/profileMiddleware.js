const asyncHandler = require("express-async-handler");

// Middleware to verify if the user's profile is complete
const verifyProfileCompletion = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user.profileCompleted) {
    return res.status(403).json({
      message: "Please complete your profile to access this resource.",
    });
  }

  next();
});

module.exports = { verifyProfileCompletion };
