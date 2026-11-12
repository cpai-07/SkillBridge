// Run with: npm run seed   (wipes users, jobs, applications and adds demo data)
require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");
const Job = require("./models/job");
const Application = require("./models/Application");
const { cleanList } = require("./utils/match");

(async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany(),
    Job.deleteMany(),
    Application.deleteMany(),
  ]);

  const employer = await User.create({
    name: "Aoife Murphy",
    email: "employer@demo.com",
    password: "password123",
    role: "employer",
    company: "Liffey Labs",
  });
  await User.create({
    name: "Chinmay",
    email: "candidate@demo.com",
    password: "password123",
    role: "candidate",
    headline: "Masters student, aspiring full-stack developer",
    bio: "Studying IT Management in Dublin.",
    skills: cleanList(["JavaScript", "React", "HTML", "CSS", "Git", "SQL"]),
  });

  const jobs = [
    [
      "Junior Full-Stack Developer",
      "Dublin",
      "Full-time",
      "€38k - €45k",
      ["JavaScript", "React", "Node.js", "MongoDB", "Git"],
    ],
    [
      "Frontend Developer",
      "Dublin (Hybrid)",
      "Full-time",
      "€40k - €50k",
      ["React", "TypeScript", "CSS", "HTML", "Git"],
    ],
    [
      "Backend Engineer (Node.js)",
      "Cork",
      "Full-time",
      "€45k - €55k",
      ["Node.js", "Express", "MongoDB", "REST", "Docker"],
    ],
    [
      "Software Engineering Intern",
      "Galway",
      "Internship",
      "€1,800 / month",
      ["JavaScript", "Git", "SQL", "HTML"],
    ],
    [
      "Data Analyst",
      "Dublin",
      "Full-time",
      "€42k - €50k",
      ["SQL", "Python", "Excel", "Power BI"],
    ],
    [
      "DevOps Engineer",
      "Remote (Ireland)",
      "Contract",
      "€350 / day",
      ["Docker", "Kubernetes", "AWS", "CI-CD", "Linux"],
    ],
    [
      "Python / ML Engineer",
      "Dublin",
      "Full-time",
      "€55k - €70k",
      ["Python", "Machine Learning", "SQL", "Git"],
    ],
    [
      "Web Developer (Part-time)",
      "Limerick",
      "Part-time",
      "€22 / hour",
      ["HTML", "CSS", "JavaScript", "WordPress"],
    ],
  ];
  await Job.insertMany(
    jobs.map(([title, location, type, salary, skills]) => ({
      employer: employer._id,
      title,
      company: employer.company,
      location,
      type,
      salary,
      description: `We are looking for a ${title} to join our growing team in ${location}. You will build and ship features used by thousands of people, work closely with designers, and grow your skills in a supportive environment.`,
      requiredSkills: cleanList(skills),
    })),
  );

  console.log(
    "Seeded. Demo logins (password: password123):\n  employer@demo.com\n  candidate@demo.com",
  );
  process.exit(0);
})();
