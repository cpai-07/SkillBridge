const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Get user details using the JWT token
async function getUser(req) {
  const header = req.headers.authorization;

  // Check whether the token is provided
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }

  try {
    // Get the token from the Authorization header
    const token = header.split(" ")[1];

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user using the ID stored in the token
    const user = await User.findById(decoded.id);

    return user;
  } catch (error) {
    return null;
  }
}

// Check whether the user is logged in
exports.protect = async (req, res, next) => {
  try {
    const user = await getUser(req);

    if (!user) {
      return res.status(401).json({
        message: "Please log in to continue",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

// Get user details if a token is available
// Does not block users who are not logged in
exports.optionalAuth = async (req, res, next) => {
  try {
    req.user = await getUser(req);

    next();
  } catch (error) {
    next(error);
  }
};

// Check whether the logged-in user has the required role
exports.requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({
        message: `Only ${role}s can do this`,
      });
    }

    next();
  };
};
