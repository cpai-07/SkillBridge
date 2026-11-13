const router = require("express").Router();

const Job = require("../models/Job");
const Application = require("../models/Application");

const { protect, optionalAuth, requireRole } = require("../middleware/auth");
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
  const jobData = {
    title: body.title,
    company: body.company,
    location: body.location,
    type: body.type,
    salary: body.salary,
    description: body.description,
    requiredSkills: cleanList(body.requiredSkills),
  };

  return jobData;
}

// ==========================================
// 1. GET ALL JOBS
// ==========================================
// URL: GET /api/jobs
// Anyone can view jobs.
// Candidates can see their matching scores.

router.get("/", optionalAuth, async (req, res) => {
  try {
    const search = req.query.search;
    const location = req.query.location;
    const type = req.query.type;
    const sort = req.query.sort;

    // Create an empty search condition
    const searchConditions = {};

    // Search by title, company, description or skills
    if (search) {
      searchConditions.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { requiredSkills: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by location
    if (location) {
      searchConditions.location = {
        $regex: location,
        $options: "i",
      };
    }

    // Filter by job type
    if (type) {
      searchConditions.type = type;
    }

    // Get jobs from the database
    const jobs = await Job.find(searchConditions)
      .sort({ createdAt: -1 })
      .lean();

    const jobsWithMatch = [];

    // Calculate matching score for each job
    for (let i = 0; i < jobs.length; i++) {
      const job = addMatchScore(jobs[i], req.user);

      jobsWithMatch.push(job);
    }

    // Sort jobs by matching score if requested
    if (sort === "match" && req.user && req.user.role === "candidate") {
      jobsWithMatch.sort(function (a, b) {
        return b.match.score - a.match.score;
      });
    }

    res.json({
      jobs: jobsWithMatch,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================================
// 2. GET SKILL GAP
// ==========================================
// URL: GET /api/jobs/skill-gap
// Only candidates can access this route.
// Shows skills the candidate is missing.

router.get(
  "/skill-gap",
  protect,
  requireRole("candidate"),
  async (req, res) => {
    try {
      // Get all available jobs
      const jobs = await Job.find().lean();

      const missingSkillsCount = {};

      let totalMatchScore = 0;

      // Check every job
      for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];

        // Compare candidate skills with job requirements
        const match = computeMatch(req.user.skills, job.requiredSkills);

        // Add the matching score
        totalMatchScore = totalMatchScore + match.score;

        // Count missing skills
        for (let j = 0; j < match.missing.length; j++) {
          const skill = match.missing[j];

          if (missingSkillsCount[skill]) {
            missingSkillsCount[skill]++;
          } else {
            missingSkillsCount[skill] = 1;
          }
        }
      }

      // Convert missing skills into an array
      const topMissingSkills = [];

      for (const skill in missingSkillsCount) {
        topMissingSkills.push({
          skill: skill,
          jobCount: missingSkillsCount[skill],
        });
      }

      // Sort by the number of jobs requiring each skill
      topMissingSkills.sort(function (a, b) {
        return b.jobCount - a.jobCount;
      });

      // Get the top 10 missing skills
      const result = topMissingSkills.slice(0, 10);

      // Calculate average matching score
      let averageMatch = 0;

      if (jobs.length > 0) {
        averageMatch = Math.round(totalMatchScore / jobs.length);
      }

      res.json({
        totalJobs: jobs.length,
        averageMatch: averageMatch,
        topMissing: result,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  },
);

// ==========================================
// 3. GET EMPLOYER'S JOBS
// ==========================================
// URL: GET /api/jobs/mine
// Only employers can access this route.
// Shows jobs posted by the logged-in employer.

router.get("/mine", protect, requireRole("employer"), async (req, res) => {
  try {
    // Find jobs posted by this employer
    const jobs = await Job.find({
      employer: req.user._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Store all job IDs
    const jobIds = [];

    for (let i = 0; i < jobs.length; i++) {
      jobIds.push(jobs[i]._id);
    }

    // Count applications for each job
    const applicationCounts = await Application.aggregate([
      {
        $match: {
          job: { $in: jobIds },
        },
      },

      {
        $group: {
          _id: "$job",
          totalApplications: { $sum: 1 },
        },
      },
    ]);

    const jobsWithApplicantCount = [];

    // Add application count to each job
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];

      let applicantCount = 0;

      // Find the application count for this job
      for (let j = 0; j < applicationCounts.length; j++) {
        if (String(applicationCounts[j]._id) === String(job._id)) {
          applicantCount = applicationCounts[j].totalApplications;

          break;
        }
      }

      jobsWithApplicantCount.push({
        ...job,
        applicantCount: applicantCount,
      });
    }

    res.json({
      jobs: jobsWithApplicantCount,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================================
// 4. GET ONE JOB BY ID
// ==========================================
// URL: GET /api/jobs/:id
// Anyone can view a job.
// Candidates can see their match score and application status.

router.get("/:id", optionalAuth, async (req, res) => {
  try {
    // Find the job using its ID
    const job = await Job.findById(req.params.id).lean();

    // Check whether the job exists
    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    // Calculate matching score for the candidate
    const jobDetails = addMatchScore(job, req.user);

    // Check whether the candidate has already applied
    if (req.user && req.user.role === "candidate") {
      const application = await Application.exists({
        job: job._id,
        candidate: req.user._id,
      });

      jobDetails.hasApplied = Boolean(application);
    }

    res.json({
      job: jobDetails,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================================
// 5. CREATE A NEW JOB
// ==========================================
// URL: POST /api/jobs
// Only employers can create jobs.

router.post("/", protect, requireRole("employer"), async (req, res) => {
  try {
    // Get job information from the request
    const jobData = prepareJobData(req.body);

    // Use employer's company name if no company is provided
    if (!jobData.company) {
      jobData.company = req.user.company;
    }

    // Create a new job in the database
    const newJob = await Job.create({
      ...jobData,

      employer: req.user._id,
    });

    res.status(201).json({
      job: newJob,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================================
// 6. UPDATE AN EXISTING JOB
// ==========================================
// URL: PUT /api/jobs/:id
// Only the employer who created the job can update it.

router.put("/:id", protect, requireRole("employer"), async (req, res) => {
  try {
    // Find the job belonging to this employer
    const job = await Job.findOne({
      _id: req.params.id,
      employer: req.user._id,
    });

    // Check whether the job exists
    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    // Get the updated job information
    const updatedData = prepareJobData(req.body);

    // Update the existing job
    Object.assign(job, updatedData);

    // Save changes in the database
    await job.save();

    res.json({
      job: job,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================================
// 7. DELETE A JOB
// ==========================================
// URL: DELETE /api/jobs/:id
// Only the employer who created the job can delete it.
// Related applications will also be deleted.

router.delete("/:id", protect, requireRole("employer"), async (req, res) => {
  try {
    // Find and delete the job
    const deletedJob = await Job.findOneAndDelete({
      _id: req.params.id,
      employer: req.user._id,
    });

    // Check whether the job exists
    if (!deletedJob) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    // Delete all applications related to this job
    await Application.deleteMany({
      job: deletedJob._id,
    });

    res.json({
      message: "Job deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Export routes
module.exports = router;
