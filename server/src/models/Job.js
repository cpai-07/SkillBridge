const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
      default: "Full-time",
    },
    salary: { type: String, trim: true },
    description: { type: String, required: true },
    requiredSkills: {
      type: [String],
      validate: [(v) => v.length > 0, "Add at least one required skill"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Job", jobSchema);
