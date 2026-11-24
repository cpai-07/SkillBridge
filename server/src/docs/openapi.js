// API documentation shown at /api/docs (Swagger UI).
// It follows the OpenAPI 3 format.

// Small helpers so the file stays short and easy to read
const needsLogin = [{ bearerAuth: [] }];

function jsonBody(properties, required) {
  return {
    required: true,
    content: {
      "application/json": {
        schema: { type: "object", required: required, properties: properties },
      },
    },
  };
}

function idParam(name) {
  return { name: name, in: "path", required: true, schema: { type: "string" } };
}

function responses(okCode, okText, extraCodes) {
  const result = { [okCode]: { description: okText } };

  for (const code in extraCodes) {
    result[code] = { description: extraCodes[code] };
  }

  return result;
}

const text = { type: "string" };
const skillList = { type: "array", items: { type: "string" } };

const jobProperties = {
  title: text,
  company: text,
  location: text,
  type: {
    type: "string",
    enum: ["Full-time", "Part-time", "Contract", "Internship"],
  },
  salary: text,
  description: text,
  requiredSkills: skillList,
};
const jobRequired = ["title", "location", "description", "requiredSkills"];

module.exports = {
  openapi: "3.0.3",
  info: {
    title: "SkillBridge API",
    version: "1.0.0",
    description:
      "REST API for the SkillBridge job portal. Log in with /auth/login, " +
      "then click Authorize and paste the token to try protected routes.",
  },
  servers: [{ url: "/api" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
  tags: [
    { name: "Auth" },
    { name: "Jobs" },
    { name: "Applications" },
    { name: "Skills" },
  ],
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Create an account (candidate or employer)",
        requestBody: jsonBody(
          {
            name: text,
            email: text,
            password: {
              type: "string",
              description: "8-64 characters, with a letter and a number",
            },
            role: { type: "string", enum: ["candidate", "employer"] },
            company: { type: "string", description: "Required for employers" },
          },
          ["name", "email", "password", "role"],
        ),
        responses: responses(201, "Account created, returns a token", {
          400: "Invalid data",
          409: "Email already registered",
          429: "Too many attempts",
        }),
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in and get a token",
        requestBody: jsonBody({ email: text, password: text }, [
          "email",
          "password",
        ]),
        responses: responses(200, "Returns a token and the user", {
          400: "Missing data",
          401: "Incorrect email or password",
          429: "Too many attempts",
        }),
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get the logged-in user",
        security: needsLogin,
        responses: responses(200, "The user", { 401: "Not logged in" }),
      },
    },
    "/auth/profile": {
      put: {
        tags: ["Auth"],
        summary: "Update the profile (candidates can also update skills)",
        security: needsLogin,
        requestBody: jsonBody(
          {
            name: text,
            headline: text,
            bio: text,
            company: text,
            skills: skillList,
          },
          [],
        ),
        responses: responses(200, "The updated user", {
          400: "Invalid data",
          401: "Not logged in",
        }),
      },
    },
    "/jobs": {
      get: {
        tags: ["Jobs"],
        summary: "List jobs (candidates also get a match score)",
        parameters: [
          { name: "search", in: "query", schema: text },
          { name: "location", in: "query", schema: text },
          { name: "type", in: "query", schema: text },
          {
            name: "sort",
            in: "query",
            schema: { type: "string", enum: ["match"] },
          },
        ],
        responses: responses(200, "A list of jobs", {}),
      },
      post: {
        tags: ["Jobs"],
        summary: "Create a job (employers only)",
        security: needsLogin,
        requestBody: jsonBody(jobProperties, jobRequired),
        responses: responses(201, "The new job", {
          400: "Invalid data",
          401: "Not logged in",
          403: "Not an employer",
        }),
      },
    },
    "/jobs/skill-gap": {
      get: {
        tags: ["Jobs"],
        summary: "Skills the candidate is missing most often (candidates only)",
        security: needsLogin,
        responses: responses(200, "Average match and top missing skills", {
          401: "Not logged in",
          403: "Not a candidate",
        }),
      },
    },
    "/jobs/mine": {
      get: {
        tags: ["Jobs"],
        summary: "Jobs posted by the logged-in employer",
        security: needsLogin,
        responses: responses(200, "A list of jobs with applicant counts", {
          401: "Not logged in",
          403: "Not an employer",
        }),
      },
    },
    "/jobs/{id}": {
      get: {
        tags: ["Jobs"],
        summary: "Get one job",
        parameters: [idParam("id")],
        responses: responses(200, "The job", {
          400: "Invalid ID",
          404: "Job not found",
        }),
      },
      put: {
        tags: ["Jobs"],
        summary: "Update a job (only the employer who owns it)",
        security: needsLogin,
        parameters: [idParam("id")],
        requestBody: jsonBody(jobProperties, jobRequired),
        responses: responses(200, "The updated job", {
          400: "Invalid data",
          401: "Not logged in",
          403: "Not an employer",
          404: "Job not found",
        }),
      },
      delete: {
        tags: ["Jobs"],
        summary: "Delete a job and its applications (only the owner)",
        security: needsLogin,
        parameters: [idParam("id")],
        responses: responses(200, "Job deleted", {
          401: "Not logged in",
          403: "Not an employer",
          404: "Job not found",
        }),
      },
    },
    "/applications/{jobId}": {
      post: {
        tags: ["Applications"],
        summary: "Apply for a job (candidates only, once per job)",
        security: needsLogin,
        parameters: [idParam("jobId")],
        requestBody: jsonBody({ coverLetter: text }, []),
        responses: responses(201, "The application", {
          401: "Not logged in",
          403: "Not a candidate",
          404: "Job not found",
          409: "Already applied",
        }),
      },
    },
    "/applications/mine": {
      get: {
        tags: ["Applications"],
        summary: "Applications of the logged-in candidate",
        security: needsLogin,
        responses: responses(200, "A list of applications", {
          401: "Not logged in",
          403: "Not a candidate",
        }),
      },
    },
    "/applications/job/{jobId}": {
      get: {
        tags: ["Applications"],
        summary: "Applicants of a job, best match first (only the owner)",
        security: needsLogin,
        parameters: [idParam("jobId")],
        responses: responses(200, "The job and its applicants", {
          401: "Not logged in",
          403: "Not an employer",
          404: "Job not found",
        }),
      },
    },
    "/applications/{id}/status": {
      patch: {
        tags: ["Applications"],
        summary: "Shortlist or reject an applicant (only the job owner)",
        security: needsLogin,
        parameters: [idParam("id")],
        requestBody: jsonBody(
          {
            status: {
              type: "string",
              enum: ["applied", "shortlisted", "rejected"],
            },
          },
          ["status"],
        ),
        responses: responses(200, "The updated application", {
          400: "Invalid status",
          401: "Not logged in",
          404: "Application not found",
        }),
      },
    },
    "/skills/extract": {
      post: {
        tags: ["Skills"],
        summary:
          "Find skills in pasted CV text (uses the Claude API, or a keyword list as backup)",
        security: needsLogin,
        requestBody: jsonBody({ text: text }, ["text"]),
        responses: responses(
          200,
          "A list of skills and where they came from (ai or keyword)",
          {
            400: "Text too short or too long",
            401: "Not logged in",
            403: "Not a candidate",
            429: "Too many requests",
          },
        ),
      },
    },
  },
};
