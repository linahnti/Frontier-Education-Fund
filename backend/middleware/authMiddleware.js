const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

const protect = async (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with "Bearer"
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      // Fetch user without password
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      req.user = {
        id: decoded.id,
        role: decoded.role,
      };
      next();
    } catch (error) {
      console.error("Token validation error:", error.message);

      // Handle specific JWT errors
      if (error instanceof jwt.TokenExpiredError) {
        return res
          .status(401)
          .json({ message: "Session expired. Please log in again." });
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return res
          .status(401)
          .json({ message: "Invalid token. Please log in again." });
      }
      if (error instanceof jwt.NotBeforeError) {
        return res
          .status(401)
          .json({ message: "Token not active yet. Try again later." });
      }

      return res.status(401).json({ message: "Not authorized, token invalid" });
    }
  } else {
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided" });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role.toLowerCase() === "admin") {
    next();
  } else {
    return res
      .status(403)
      .json({ message: "Access denied. Admin privileges required." });
  }
};

module.exports = { protect, admin };
