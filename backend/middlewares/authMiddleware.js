const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes that require authentication
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      return next();
    } catch (error) {
      console.error("Token verification failed:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Middleware for Socket authentication
const authenticateSocket = async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    console.error("Socket authentication failed: No token provided");
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.error("Socket authentication failed: User not found");
      return next(new Error("Authentication error: User not found"));
    }

    socket.user = user; // Attach the authenticated user to the socket object
    next();
  } catch (error) {
    console.error("Socket authentication failed:", error.message);
    next(new Error("Authentication error: Invalid or expired token"));
  }
};

module.exports = { protect, authenticateSocket };
