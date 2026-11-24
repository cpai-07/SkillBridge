const Job = require("../models/Job");
const Application = require("../models/Application");
const httpError = require("../utils/httpError");
const { computeMatch } = require("../utils/match");

// 1. A candidate applies for a job
async function applyToJob(jobId, candidate, coverLetter) {
  const job = await Job.findById(jobId);

  if (!job) {
    throw httpError(404, "Job not found");
  }

  // A candidate can only apply once
  const existingApplication = await Application.findOne({
    job: job._id,
    candidate: candidate._id,
  });

  if (existingApplication) {
    throw httpError(409, "You have already applied to this job");
  }

  // Save the score at the time of applying
  const match = computeMatch(candidate.skills, job.requiredSkills);

  return await Application.create({
    job: job._id,
    candidate: candidate._id,
    coverLetter: coverLetter,
    matchScore: match.score,
  });
}

// 2. All applications of one candidate
async function getMyApplications(candidate) {
  const applications = await Application.find({ candidate: candidate._id })
    .populate("job")
    .sort({ createdAt: -1 })
    .lean();

  // Remove applications whose job was deleted
  const validApplications = [];

  for (let i = 0; i < applications.length; i++) {
    if (applications[i].job) {
      validApplications.push(applications[i]);
    }
  }

  return validApplications;
}

// 3. Applicants of one job, best match first (only the job owner)
async function getApplicantsForJob(jobId, employer) {
  const job = await Job.findOne({ _id: jobId, employer: employer._id }).lean();

  if (!job) {
    throw httpError(404, "Job not found");
  }

  const applications = await Application.find({ job: job._id })
    .populate("candidate", "name email headline skills")
    .lean();

  const applicants = [];

  for (let i = 0; i < applications.length; i++) {
    const application = applications[i];

    // Skip applications if the candidate account was deleted
    if (!application.candidate) {
      continue;
    }

    const match = computeMatch(
      application.candidate.skills,
      job.requiredSkills,
    );

    applicants.push({ ...application, match: match });
  }

  applicants.sort(function (a, b) {
    return b.match.score - a.match.score;
  });

  return { job: job, applicants: applicants };
}

// 4. Change the status of an application (only the job owner)
async function updateApplicationStatus(applicationId, status, employer) {
  const application = await Application.findById(applicationId).populate("job");

  // The same message is used when the job belongs to someone else
  if (
    !application ||
    !application.job ||
    String(application.job.employer) !== String(employer._id)
  ) {
    throw httpError(404, "Application not found");
  }

  application.status = status;
  await application.save();

  return application;
}

module.exports = {
  applyToJob,
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus,
};
