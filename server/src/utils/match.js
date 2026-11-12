const ALIASES = {
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

const normalize = (skill) => {
  const s = String(skill || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  return ALIASES[s] || s;
};

const cleanList = (skills = []) => [
  ...new Set(skills.map(normalize).filter(Boolean)),
];

function computeMatch(candidateSkills = [], requiredSkills = []) {
  const have = new Set(cleanList(candidateSkills));
  const required = cleanList(requiredSkills);
  if (required.length === 0) return { score: 0, matched: [], missing: [] };

  const matched = required.filter((s) => have.has(s));
  const missing = required.filter((s) => !have.has(s));
  const score = Math.round((matched.length / required.length) * 100);
  return { score, matched, missing };
}

module.exports = { normalize, cleanList, computeMatch };
