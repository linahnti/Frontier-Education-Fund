const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

const protect = async (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with "Bearer"
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1]; // Extract token
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Verify token

      // Fetch user without password
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      req.user = user; // Attach user data to request
      next(); // Continue to the next middleware
    } catch (error) {
      console.error("Token validation error:", error.message);

      // Handle specific JWT errors
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: "Session expired. Please log in again." });
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: "Invalid token. Please log in again." });
      }
      if (error instanceof jwt.NotBeforeError) {
        return res.status(401).json({ message: "Token not active yet. Try again later." });
      }

      return res.status(401).json({ message: "Not authorized, token invalid" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

module.exports = { protect };
