const skillService = require("../services/skillService");

// POST /api/skills/extract
async function extractSkills(req, res, next) {
  try {
    const result = await skillService.extractSkills(req.body.text);

    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { extractSkills };
