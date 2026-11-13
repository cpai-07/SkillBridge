const router = require("express").Router();

const Job = require("../models/Job");
const Application = require("../models/Application");

const { protect, requireRole } = require("../middleware/auth");
const { computeMatch } = require("../utils/match");

// 1. Apply for a job
// POST /api/applications/:jobId

router.post("/:jobId", protect, requireRole("candidate"), async (req, res) => {
  try {
    // Find the job
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check whether the candidate has already applied
    const existingApplication = await Application.findOne({
      job: job._id,
      candidate: req.user._id,
    });

    if (existingApplication) {
      return res.status(409).json({
        message: "You have already applied to this job",
      });
    }

    // Calculate the candidate's matching score
    const match = computeMatch(req.user.skills, job.requiredSkills);

    // Create the application
    const application = await Application.create({
      job: job._id,
      candidate: req.user._id,
      coverLetter: req.body.coverLetter,
      matchScore: match.score,
    });

    res.status(201).json({ application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Get all applications submitted by the logged-in candidate
// GET /api/applications/mine

router.get("/mine", protect, requireRole("candidate"), async (req, res) => {
  try {
    const applications = await Application.find({
      candidate: req.user._id,
    })
      .populate("job")
      .sort({ createdAt: -1 })
      .lean();

    // Remove applications whose job no longer exists
    const validApplications = [];

    for (let i = 0; i < applications.length; i++) {
      if (applications[i].job) {
        validApplications.push(applications[i]);
      }
    }

    res.json({ applications: validApplications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Get applicants for an employer's job
// GET /api/applications/job/:jobId

router.get(
  "/job/:jobId",
  protect,
  requireRole("employer"),
  async (req, res) => {
    try {
      // Find the job belonging to this employer
      const job = await Job.findOne({
        _id: req.params.jobId,
        employer: req.user._id,
      }).lean();

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Get all applications for this job
      const applications = await Application.find({
        job: job._id,
      })
        .populate("candidate", "name email headline skills")
        .lean();

      const applicants = [];

      // Calculate the matching score for every applicant
      for (let i = 0; i < applications.length; i++) {
        const application = applications[i];

        // Skip applications if the candidate no longer exists
        if (!application.candidate) {
          continue;
        }

        const match = computeMatch(
          application.candidate.skills,
          job.requiredSkills,
        );

        applicants.push({
          ...application,
          match: match,
        });
      }

      // Sort applicants from highest match score to lowest
      applicants.sort(function (a, b) {
        return b.match.score - a.match.score;
      });

      res.json({
        job: job,
        applicants: applicants,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// 4. Update an application status
// PATCH /api/applications/:id/status

router.patch(
  "/:id/status",
  protect,
  requireRole("employer"),
  async (req, res) => {
    try {
      const status = req.body.status;

      // Check whether the status is valid
      if (
        status !== "applied" &&
        status !== "shortlisted" &&
        status !== "rejected"
      ) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // Find the application and its related job
      const application = await Application.findById(req.params.id).populate(
        "job",
      );

      if (!application || !application.job) {
        return res.status(404).json({
          message: "Application not found",
        });
      }

      // Make sure this employer owns the job
      if (String(application.job.employer) !== String(req.user._id)) {
        return res.status(404).json({
          message: "Application not found",
        });
      }

      // Update and save the status
      application.status = status;

      await application.save();

      res.json({ application: application });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

module.exports = router;
