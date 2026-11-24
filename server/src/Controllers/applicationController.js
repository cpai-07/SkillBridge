const applicationService = require("../services/applicationService");

// POST /api/applications/:jobId
async function applyToJob(req, res, next) {
  try {
    const application = await applicationService.applyToJob(
      req.params.jobId,
      req.user,
      req.body.coverLetter,
    );

    res.status(201).json({ application: application });
  } catch (error) {
    next(error);
  }
}

// GET /api/applications/mine
async function getMyApplications(req, res, next) {
  try {
    const applications = await applicationService.getMyApplications(req.user);

    res.json({ applications: applications });
  } catch (error) {
    next(error);
  }
}

// GET /api/applications/job/:jobId
async function getApplicantsForJob(req, res, next) {
  try {
    const result = await applicationService.getApplicantsForJob(
      req.params.jobId,
      req.user,
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
}

// PATCH /api/applications/:id/status
async function updateApplicationStatus(req, res, next) {
  try {
    const application = await applicationService.updateApplicationStatus(
      req.params.id,
      req.body.status,
      req.user,
    );

    res.json({ application: application });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  applyToJob,
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus,
};
