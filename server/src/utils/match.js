// ==========================================
// 1. SKILL ALIASES
// ==========================================

// Different people may write the same skill in different ways.
// We convert them into one common name.

const skillAliases = {
  js: "javascript",
  ts: "typescript",

  reactjs: "react",
  "react.js": "react",

  node: "node.js",
  nodejs: "node.js",

  expressjs: "express",
  "express.js": "express",

  mongo: "mongodb",
  postgres: "postgresql",

  k8s: "kubernetes",

  "ci/cd": "ci-cd",

  html5: "html",
  css3: "css",
};

// ==========================================
// 2. NORMALIZE A SKILL
// ==========================================

// This function cleans one skill name.
// It removes extra spaces and converts it to lowercase.
// It also checks whether the skill has another common name.

function normalizeSkill(skill) {
  // Convert skill into a string
  let skillName = String(skill || "");

  // Remove extra spaces from beginning and end
  skillName = skillName.trim();

  // Convert all letters to lowercase
  skillName = skillName.toLowerCase();

  // Replace multiple spaces with a single space
  skillName = skillName.replace(/\s+/g, " ");

  // Check whether this skill has another common name
  if (skillAliases[skillName]) {
    return skillAliases[skillName];
  }

  // Return the cleaned skill name
  return skillName;
}

// ==========================================
// 3. CLEAN A LIST OF SKILLS
// ==========================================

// This function cleans multiple skills.
// It also removes duplicate skills.

function cleanList(skills = []) {
  // Create an empty array to store cleaned skills
  const cleanedSkills = [];

  // Check every skill in the list
  for (let i = 0; i < skills.length; i++) {
    // Clean the current skill
    const skill = normalizeSkill(skills[i]);

    // Ignore empty skills
    if (skill === "") {
      continue;
    }

    // Check whether the skill is already in the array
    if (!cleanedSkills.includes(skill)) {
      // Add the skill if it is not already present
      cleanedSkills.push(skill);
    }
  }

  // Return the final cleaned list
  return cleanedSkills;
}

// ==========================================
// 4. CALCULATE CANDIDATE MATCH SCORE
// ==========================================

// This function compares candidate skills with job requirements.
// It returns:
// 1. Matching percentage
// 2. Skills the candidate already has
// 3. Skills the candidate is missing

function computeMatch(candidateSkills = [], requiredSkills = []) {
  // First, clean both skill lists
  const candidateSkillList = cleanList(candidateSkills);

  const requiredSkillList = cleanList(requiredSkills);

  // Create empty arrays
  const matchedSkills = [];

  const missingSkills = [];

  // Check whether the job has any required skills
  if (requiredSkillList.length === 0) {
    return {
      score: 0,

      matched: [],

      missing: [],
    };
  }

  // Check every skill required for the job
  for (let i = 0; i < requiredSkillList.length; i++) {
    const requiredSkill = requiredSkillList[i];

    // Check whether the candidate has this skill
    if (candidateSkillList.includes(requiredSkill)) {
      // Candidate has this skill
      matchedSkills.push(requiredSkill);
    } else {
      // Candidate does not have this skill
      missingSkills.push(requiredSkill);
    }
  }

  // Calculate matching percentage
  const totalRequiredSkills = requiredSkillList.length;

  const totalMatchedSkills = matchedSkills.length;

  const matchingScore = Math.round(
    (totalMatchedSkills / totalRequiredSkills) * 100,
  );

  // Return all matching information
  return {
    score: matchingScore,

    matched: matchedSkills,

    missing: missingSkills,
  };
}

// ==========================================
// 5. EXPORT FUNCTIONS
// ==========================================

// Make these functions available in other files

module.exports = {
  normalize: normalizeSkill,

  cleanList: cleanList,

  computeMatch: computeMatch,
};
