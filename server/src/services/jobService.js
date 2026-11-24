const Job = require("../models/Job");
const Application = require("../models/Application");
const httpError = require("../utils/httpError");
const { JOB_TYPES } = require("../utils/constants");
const { computeMatch, cleanList } = require("../utils/match");

// Helper 1: Calculate how well a job matches a candidate
function addMatchScore(job, user) {
  // Only calculate matching score for candidates
  if (user && user.role === "candidate") {
    const match = computeMatch(user.skills, job.requiredSkills);

    return {
      ...job,
      match: match,
    };
  }

  return job;
}

// Helper 2: Prepare job information before saving
function prepareJobData(body) {
  return {
    title: body.title,
    company: body.company,
    location: body.location,
    type: body.type,
    salary: body.salary,
    description: body.description,
    requiredSkills: cleanList(body.requiredSkills),
  };
}

// Helper 3: Make search text safe to use inside a regular expression.
// Without this, a user could type special characters like ( or *
// and change how the database search works.
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Helper 4: Only accept plain text from the URL (?search=react)
function asText(value) {
  if (typeof value === "string") {
    return value.trim().slice(0, 100);
  }

  return "";
}

// 1. Get all jobs (with filters)
async function getJobs(query, user) {
  const search = asText(query.search);
  const location = asText(query.location);
  const type = asText(query.type);

  const searchConditions = {};

  // Search by title, company, description or skills
  if (search) {
    const safeSearch = escapeRegex(search);

    searchConditions.$or = [
      { title: { $regex: safeSearch, $options: "i" } },
      { company: { $regex: safeSearch, $options: "i" } },
      { description: { $regex: safeSearch, $options: "i" } },
      { requiredSkills: { $regex: safeSearch, $options: "i" } },
    ];
  }

  // Filter by location
  if (location) {
    searchConditions.location = {
      $regex: escapeRegex(location),
      $options: "i",
    };
  }

  // Filter by job type (only the allowed types)
  if (JOB_TYPES.includes(type)) {
    searchConditions.type = type;
  }

  const jobs = await Job.find(searchConditions).sort({ createdAt: -1 }).lean();

  const jobsWithMatch = [];

  for (let i = 0; i < jobs.length; i++) {
    jobsWithMatch.push(addMatchScore(jobs[i], user));
  }

  // Sort by matching score if the candidate asked for it
  if (query.sort === "match" && user && user.role === "candidate") {
    jobsWithMatch.sort(function (a, b) {
      return b.match.score - a.match.score;
    });
  }

  return jobsWithMatch;
}

// 2. Get one job by its ID
async function getJobById(id, user) {
  const job = await Job.findById(id).lean();

  if (!job) {
    throw httpError(404, "Job not found");
  }

  const jobDetails = addMatchScore(job, user);

  // Tell the candidate if they have already applied, and the status
  if (user && user.role === "candidate") {
    const application = await Application.findOne({
      job: job._id,
      candidate: user._id,
    });

    jobDetails.hasApplied = Boolean(application);
    jobDetails.applicationStatus = application ? application.status : null;
  }

  return jobDetails;
}

// 3. Skills the candidate is missing across all jobs
async function getSkillGap(user) {
  const jobs = await Job.find().lean();

  const missingSkillsCount = {};
  let totalMatchScore = 0;

  for (let i = 0; i < jobs.length; i++) {
    const match = computeMatch(user.skills, jobs[i].requiredSkills);

    totalMatchScore = totalMatchScore + match.score;

    // Count how many jobs need each missing skill
    for (let j = 0; j < match.missing.length; j++) {
      const skill = match.missing[j];

      if (missingSkillsCount[skill]) {
        missingSkillsCount[skill]++;
      } else {
        missingSkillsCount[skill] = 1;
      }
    }
  }

  const topMissing = [];

  for (const skill in missingSkillsCount) {
    topMissing.push({ skill: skill, jobCount: missingSkillsCount[skill] });
  }

  // Skills needed by the most jobs come first
  topMissing.sort(function (a, b) {
    return b.jobCount - a.jobCount;
  });

  let averageMatch = 0;

  if (jobs.length > 0) {
    averageMatch = Math.round(totalMatchScore / jobs.length);
  }

  return {
    totalJobs: jobs.length,
    averageMatch: averageMatch,
    topMissing: topMissing.slice(0, 10),
  };
}

// 4. Jobs posted by one employer, with the number of applicants
async function getEmployerJobs(employer) {
  const jobs = await Job.find({ employer: employer._id })
    .sort({ createdAt: -1 })
    .lean();

  const jobIds = [];

  for (let i = 0; i < jobs.length; i++) {
    jobIds.push(jobs[i]._id);
  }

  // Count the applications for each job
  const applicationCounts = await Application.aggregate([
    { $match: { job: { $in: jobIds } } },
    { $group: { _id: "$job", totalApplications: { $sum: 1 } } },
  ]);

  const jobsWithApplicantCount = [];

  for (let i = 0; i < jobs.length; i++) {
    let applicantCount = 0;

    for (let j = 0; j < applicationCounts.length; j++) {
      if (String(applicationCounts[j]._id) === String(jobs[i]._id)) {
        applicantCount = applicationCounts[j].totalApplications;
        break;
      }
    }

    jobsWithApplicantCount.push({ ...jobs[i], applicantCount: applicantCount });
  }

  return jobsWithApplicantCount;
}

// 5. Create a job
async function createJob(data, employer) {
  const jobData = prepareJobData(data);

  // Use the employer's company name if none was typed
  if (!jobData.company) {
    jobData.company = employer.company;
  }

  return await Job.create({ ...jobData, employer: employer._id });
}

// 6. Update a job (only the employer who owns it)
async function updateJob(id, data, employer) {
  const job = await Job.findOne({ _id: id, employer: employer._id });

  // Another employer's job also gives "not found", so we do not reveal it exists
  if (!job) {
    throw httpError(404, "Job not found");
  }

  Object.assign(job, prepareJobData(data));
  await job.save();

  return job;
}

// 7. Delete a job and its applications (only the employer who owns it)
async function deleteJob(id, employer) {
  const deletedJob = await Job.findOneAndDelete({
    _id: id,
    employer: employer._id,
  });

  if (!deletedJob) {
    throw httpError(404, "Job not found");
  }

  await Application.deleteMany({ job: deletedJob._id });
}

module.exports = {
  getJobs,
  getJobById,
  getSkillGap,
  getEmployerJobs,
  createJob,
  updateJob,
  deleteJob,
};
