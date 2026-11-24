const router = require("express").Router();

const jobController = require("../Controllers/jobController");
const { protect, optionalAuth, requireRole } = require("../middleware/auth");
const { validateJob, validateObjectId } = require("../middleware/validate");

// Anyone can view jobs. Candidates also get their match score.
router.get("/", optionalAuth, jobController.getJobs);

// These two must stay above "/:id", or Express would treat
// "skill-gap" and "mine" as job IDs.
router.get(
  "/skill-gap",
  protect,
  requireRole("candidate"),
  jobController.getSkillGap,
);
router.get(
  "/mine",
  protect,
  requireRole("employer"),
  jobController.getEmployerJobs,
);

router.get(
  "/:id",
  optionalAuth,
  validateObjectId("id"),
  jobController.getJobById,
);

// Only employers can create, change or delete jobs
router.post(
  "/",
  protect,
  requireRole("employer"),
  validateJob,
  jobController.createJob,
);
router.put(
  "/:id",
  protect,
  requireRole("employer"),
  validateObjectId("id"),
  validateJob,
  jobController.updateJob,
);
router.delete(
  "/:id",
  protect,
  requireRole("employer"),
  validateObjectId("id"),
  jobController.deleteJob,
);

module.exports = router;
