const router = require("express").Router();

const skillController = require("../Controllers/skillController");
const { protect, requireRole } = require("../middleware/auth");
const { aiLimiter } = require("../middleware/rateLimit");
const { validateCvText } = require("../middleware/validate");

// POST /api/skills/extract - find skills in pasted CV text
router.post(
  "/extract",
  protect,
  requireRole("candidate"),
  aiLimiter,
  validateCvText,
  skillController.extractSkills,
);

module.exports = router;
