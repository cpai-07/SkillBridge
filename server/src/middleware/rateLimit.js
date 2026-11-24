const rateLimit = require("express-rate-limit");

// Rate limiting stops one person (or script) from sending too many requests.
// If the limit is passed, the user gets a 429 "Too Many Requests" response.

// 1. General limit for every API route
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

// 2. Stricter limit for login and register
// Only failed attempts are counted, so normal users are not blocked.
// This slows down password guessing attacks.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again in 15 minutes." },
});

// 3. Limit for the AI skill extraction (it costs money for every call)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "You have used the CV tool too many times. Try later." },
});

module.exports = { apiLimiter, authLimiter, aiLimiter };
