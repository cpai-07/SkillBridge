// These tests call the real Express app with Supertest.
// The database models are replaced with fakes, so no MongoDB is needed.

process.env.JWT_SECRET = "test-secret";

jest.mock("../src/models/User", () => ({ findById: jest.fn() }));
jest.mock("../src/models/Job", () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
}));
jest.mock("../src/models/Application", () => ({}));

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../src/app");
const User = require("../src/models/User");
const Job = require("../src/models/Job");

// Helper: log in as a fake user with the given role
function loginAs(role) {
  User.findById.mockResolvedValue({ _id: "u1", role: role, skills: [] });
  return "Bearer " + jwt.sign({ id: "u1" }, process.env.JWT_SECRET);
}

const validObjectId = "64b7f0f2f1a2b3c4d5e6f708";

describe("basic routes", () => {
  test("health check works", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test("unknown route returns 404 as JSON", async () => {
    const res = await request(app).get("/api/nothing-here");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Route not found");
  });

  test("API docs page is available", async () => {
    const res = await request(app).get("/api/docs/");

    expect(res.status).toBe(200);
  });

  test("security headers are set by helmet", async () => {
    const res = await request(app).get("/api/health");

    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  test("bad JSON returns 400", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send("{ not valid json");

    expect(res.status).toBe(400);
  });
});

describe("authentication", () => {
  test("register rejects a weak password", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "short",
      role: "candidate",
    });

    expect(res.status).toBe(400);
  });

  test("login rejects a NoSQL injection attempt", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: { $gt: "" }, password: { $gt: "" } });

    expect(res.status).toBe(400);
  });

  test("protected route without a token returns 401", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
  });

  test("token signed with the wrong secret returns 401", async () => {
    const fakeToken = jwt.sign({ id: "u1" }, "some-other-secret");

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer " + fakeToken);

    expect(res.status).toBe(401);
  });
});

describe("authorisation (roles and ownership)", () => {
  const goodJob = {
    title: "Frontend Developer",
    location: "Dublin",
    description: "Build and improve our React web application every day.",
    requiredSkills: ["react"],
  };

  test("a candidate cannot create a job (403)", async () => {
    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", loginAs("candidate"))
      .send(goodJob);

    expect(res.status).toBe(403);
  });

  test("an employer cannot use candidate-only routes (403)", async () => {
    const res = await request(app)
      .get("/api/applications/mine")
      .set("Authorization", loginAs("employer"));

    expect(res.status).toBe(403);
  });

  test("an employer cannot post a job without skills (400)", async () => {
    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", loginAs("employer"))
      .send({ ...goodJob, requiredSkills: [] });

    expect(res.status).toBe(400);
  });

  test("editing another employer's job returns 404", async () => {
    // The database finds nothing for this job + this employer
    Job.findOne.mockResolvedValue(null);

    const res = await request(app)
      .put("/api/jobs/" + validObjectId)
      .set("Authorization", loginAs("employer"))
      .send(goodJob);

    expect(res.status).toBe(404);
  });

  test("an invalid job ID returns 400", async () => {
    const res = await request(app)
      .put("/api/jobs/123")
      .set("Authorization", loginAs("employer"))
      .send(goodJob);

    expect(res.status).toBe(400);
  });

  test("CV tool rejects text that is too short", async () => {
    const res = await request(app)
      .post("/api/skills/extract")
      .set("Authorization", loginAs("candidate"))
      .send({ text: "too short" });

    expect(res.status).toBe(400);
  });

  test("CV tool works for a candidate", async () => {
    const res = await request(app)
      .post("/api/skills/extract")
      .set("Authorization", loginAs("candidate"))
      .send({
        text: "I am a developer who works with React, Node.js and MongoDB every day.",
      });

    expect(res.status).toBe(200);
    expect(res.body.skills).toEqual(
      expect.arrayContaining(["react", "node.js", "mongodb"]),
    );
  });
});

describe("rate limiting", () => {
  test("too many failed logins return 429", async () => {
    // A different IP, so other tests are not affected
    const attempt = () =>
      request(app)
        .post("/api/auth/login")
        .set("X-Forwarded-For", "9.9.9.9")
        .send({ email: "bad" });

    for (let i = 0; i < 10; i++) {
      await attempt();
    }

    const res = await attempt();

    expect(res.status).toBe(429);
  });
});
