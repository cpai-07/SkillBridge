const jobService = require("../services/jobService");

// GET /api/jobs
async function getJobs(req, res, next) {
  try {
    const jobs = await jobService.getJobs(req.query, req.user);

    res.json({ jobs: jobs });
  } catch (error) {
    next(error);
  }
}

// GET /api/jobs/skill-gap
async function getSkillGap(req, res, next) {
  try {
    const result = await jobService.getSkillGap(req.user);

    res.json(result);
  } catch (error) {
    next(error);
  }
}

// GET /api/jobs/mine
async function getEmployerJobs(req, res, next) {
  try {
    const jobs = await jobService.getEmployerJobs(req.user);

    res.json({ jobs: jobs });
  } catch (error) {
    next(error);
  }
}

// GET /api/jobs/:id
async function getJobById(req, res, next) {
  try {
    const job = await jobService.getJobById(req.params.id, req.user);

    res.json({ job: job });
  } catch (error) {
    next(error);
  }
}

// POST /api/jobs
async function createJob(req, res, next) {
  try {
    const job = await jobService.createJob(req.body, req.user);

    res.status(201).json({ job: job });
  } catch (error) {
    next(error);
  }
}

// PUT /api/jobs/:id
async function updateJob(req, res, next) {
  try {
    const job = await jobService.updateJob(req.params.id, req.body, req.user);

    res.json({ job: job });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/jobs/:id
async function deleteJob(req, res, next) {
  try {
    await jobService.deleteJob(req.params.id, req.user);

    res.json({ message: "Job deleted" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getJobs,
  getSkillGap,
  getEmployerJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};
