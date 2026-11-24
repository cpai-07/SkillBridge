const {
  ROLES,
  JOB_TYPES,
  APPLICATION_STATUSES,
} = require("../utils/constants");

// ==========================================
// Server-side validation
// ==========================================
// Checking data in the browser is not enough, because anyone can send
// a request without using our website. So every route checks its input here.
//
// Each function below does three things:
// 1. Checks the data is the right type and length
// 2. Cleans it (removes extra spaces)
// 3. Keeps ONLY the fields we expect, so extra fields are ignored

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

function isString(value) {
  return typeof value === "string";
}

function sendError(res, message) {
  return res.status(400).json({ message: message });
}

// Checks a list of skills. Returns an error message, or "" if it is fine.
function checkSkillList(skills, minItems, maxItems) {
  if (!Array.isArray(skills)) {
    return "Skills must be a list";
  }

  if (skills.length < minItems) {
    return "Add at least " + minItems + " skill";
  }

  if (skills.length > maxItems) {
    return "You can add up to " + maxItems + " skills";
  }

  for (let i = 0; i < skills.length; i++) {
    if (!isString(skills[i]) || skills[i].trim().length === 0) {
      return "Each skill must be some text";
    }

    if (skills[i].length > 40) {
      return "A skill name can have up to 40 characters";
    }
  }

  return "";
}

// 1. Register
function validateRegister(req, res, next) {
  const { name, email, password, role, company } = req.body;

  if (
    !isString(name) ||
    !isString(email) ||
    !isString(password) ||
    !isString(role)
  ) {
    return sendError(res, "Name, email, password and role are required");
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (cleanName.length < 2 || cleanName.length > 60) {
    return sendError(res, "Name must be between 2 and 60 characters");
  }

  if (!EMAIL_PATTERN.test(cleanEmail) || cleanEmail.length > 100) {
    return sendError(res, "Please enter a valid email address");
  }

  // bcrypt only uses the first 72 bytes, so we stop the password at 64 characters
  if (password.length < 8 || password.length > 64) {
    return sendError(res, "Password must be between 8 and 64 characters");
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return sendError(
      res,
      "Password must contain at least one letter and one number",
    );
  }

  if (!ROLES.includes(role)) {
    return sendError(res, "Role must be candidate or employer");
  }

  let cleanCompany;

  if (role === "employer") {
    if (!isString(company) || company.trim().length < 2) {
      return sendError(res, "Company name is required for employers");
    }

    cleanCompany = company.trim().slice(0, 100);
  }

  req.body = {
    name: cleanName,
    email: cleanEmail,
    password: password,
    role: role,
    company: cleanCompany,
  };

  next();
}

// 2. Login
function validateLogin(req, res, next) {
  const { email, password } = req.body;

  // Checking for strings also blocks NoSQL injection like { "$gt": "" }
  if (!isString(email) || !isString(password) || !email || !password) {
    return sendError(res, "Email and password are required");
  }

  req.body = { email: email.trim().toLowerCase(), password: password };

  next();
}

// 3. Update profile (every field is optional)
function validateProfile(req, res, next) {
  const { name, headline, bio, company, skills } = req.body;
  const cleaned = {};

  if (name !== undefined) {
    if (!isString(name) || name.trim().length < 2 || name.length > 60) {
      return sendError(res, "Name must be between 2 and 60 characters");
    }
    cleaned.name = name.trim();
  }

  if (headline !== undefined) {
    if (!isString(headline) || headline.length > 100) {
      return sendError(res, "Headline can have up to 100 characters");
    }
    cleaned.headline = headline.trim();
  }

  if (bio !== undefined) {
    if (!isString(bio) || bio.length > 500) {
      return sendError(res, "About you can have up to 500 characters");
    }
    cleaned.bio = bio.trim();
  }

  if (company !== undefined) {
    if (!isString(company) || company.length > 100) {
      return sendError(res, "Company can have up to 100 characters");
    }
    cleaned.company = company.trim();
  }

  if (skills !== undefined) {
    const problem = checkSkillList(skills, 0, 30);
    if (problem) {
      return sendError(res, problem);
    }
    cleaned.skills = skills;
  }

  req.body = cleaned;

  next();
}

// 4. Create or update a job
function validateJob(req, res, next) {
  const {
    title,
    company,
    location,
    type,
    salary,
    description,
    requiredSkills,
  } = req.body;

  if (!isString(title) || title.trim().length < 3 || title.length > 100) {
    return sendError(res, "Job title must be between 3 and 100 characters");
  }

  if (
    !isString(location) ||
    location.trim().length < 2 ||
    location.length > 100
  ) {
    return sendError(res, "Location must be between 2 and 100 characters");
  }

  if (
    !isString(description) ||
    description.trim().length < 20 ||
    description.length > 5000
  ) {
    return sendError(res, "Description must be between 20 and 5000 characters");
  }

  if (company !== undefined && (!isString(company) || company.length > 100)) {
    return sendError(res, "Company can have up to 100 characters");
  }

  if (type !== undefined && !JOB_TYPES.includes(type)) {
    return sendError(res, "Job type must be one of: " + JOB_TYPES.join(", "));
  }

  if (salary !== undefined && (!isString(salary) || salary.length > 50)) {
    return sendError(res, "Salary can have up to 50 characters");
  }

  const problem = checkSkillList(requiredSkills, 1, 20);
  if (problem) {
    return sendError(res, problem);
  }

  req.body = {
    title: title.trim(),
    company: company ? company.trim() : undefined,
    location: location.trim(),
    type: type,
    salary: salary ? salary.trim() : undefined,
    description: description.trim(),
    requiredSkills: requiredSkills,
  };

  next();
}

// 5. Apply for a job
function validateApplication(req, res, next) {
  const { coverLetter } = req.body;

  if (coverLetter !== undefined) {
    if (!isString(coverLetter) || coverLetter.length > 2000) {
      return sendError(res, "Cover letter can have up to 2000 characters");
    }
  }

  req.body = { coverLetter: coverLetter ? coverLetter.trim() : undefined };

  next();
}

// 6. Change the status of an application
function validateStatus(req, res, next) {
  const { status } = req.body;

  if (!APPLICATION_STATUSES.includes(status)) {
    return sendError(res, "Invalid status");
  }

  req.body = { status: status };

  next();
}

// 7. Check that an ID in the URL looks like a MongoDB ID
function validateObjectId(paramName) {
  return function (req, res, next) {
    if (!OBJECT_ID_PATTERN.test(req.params[paramName])) {
      return sendError(res, "Invalid ID");
    }

    next();
  };
}

// 8. CV text for skill extraction
function validateCvText(req, res, next) {
  const { text } = req.body;

  if (!isString(text) || text.trim().length < 30 || text.length > 8000) {
    return sendError(
      res,
      "Please paste between 30 and 8000 characters of CV text",
    );
  }

  req.body = { text: text.trim() };

  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateProfile,
  validateJob,
  validateApplication,
  validateStatus,
  validateObjectId,
  validateCvText,
};
