const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]; // Extract the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Verify the token
      req.user = await User.findById(decoded.id).select("-password"); // Attach user to request

      if (!req.user) {
        return res.status(404).json({ message: "User not found" }); // Ensure no further execution
      }

      next(); // Call the next middleware
    } catch (error) {
      console.error("Token validation error:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" }); // Ensure response and stop
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" }); // No token provided
  }
};

module.exports = { protect };
