const router = require("express").Router();

const applicationController = require("../Controllers/applicationController");
const { protect, requireRole } = require("../middleware/auth");
const {
  validateApplication,
  validateStatus,
  validateObjectId,
} = require("../middleware/validate");

// Candidate routes
router.get(
  "/mine",
  protect,
  requireRole("candidate"),
  applicationController.getMyApplications,
);
router.post(
  "/:jobId",
  protect,
  requireRole("candidate"),
  validateObjectId("jobId"),
  validateApplication,
  applicationController.applyToJob,
);

// Employer routes
router.get(
  "/job/:jobId",
  protect,
  requireRole("employer"),
  validateObjectId("jobId"),
  applicationController.getApplicantsForJob,
);
router.patch(
  "/:id/status",
  protect,
  requireRole("employer"),
  validateObjectId("id"),
  validateStatus,
  applicationController.updateApplicationStatus,
);

module.exports = router;
