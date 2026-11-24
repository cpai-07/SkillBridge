const {
  validateRegister,
  validateLogin,
  validateJob,
  validateObjectId,
} = require("../src/middleware/validate");

// A tiny fake "res" so we can read the status and message
function fakeResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function runValidator(validator, body) {
  const req = { body: body };
  const res = fakeResponse();
  const next = jest.fn();

  validator(req, res, next);

  return { req, res, next };
}

const goodUser = {
  name: "Chinmay",
  email: "Chinmay@Example.com ",
  password: "password123",
  role: "candidate",
};

describe("validateRegister", () => {
  test("accepts good data and cleans the email", () => {
    const { req, next } = runValidator(validateRegister, goodUser);

    expect(next).toHaveBeenCalled();
    expect(req.body.email).toBe("chinmay@example.com");
  });

  test("rejects a short password", () => {
    const { res, next } = runValidator(validateRegister, {
      ...goodUser,
      password: "abc1",
    });

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("rejects a password without a number", () => {
    const { res } = runValidator(validateRegister, {
      ...goodUser,
      password: "onlyletters",
    });

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("rejects an employer without a company", () => {
    const { res } = runValidator(validateRegister, {
      ...goodUser,
      role: "employer",
    });

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("ignores extra fields such as isAdmin", () => {
    const { req } = runValidator(validateRegister, {
      ...goodUser,
      isAdmin: true,
    });

    expect(req.body.isAdmin).toBeUndefined();
  });
});

describe("validateLogin", () => {
  test("blocks a NoSQL injection object", () => {
    const { res, next } = runValidator(validateLogin, {
      email: { $gt: "" },
      password: "anything",
    });

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe("validateJob", () => {
  const goodJob = {
    title: "Frontend Developer",
    location: "Dublin",
    description: "Build and improve our React web application every day.",
    requiredSkills: ["react", "css"],
  };

  test("accepts a good job", () => {
    expect(runValidator(validateJob, goodJob).next).toHaveBeenCalled();
  });

  test("rejects a job with no skills", () => {
    const { res } = runValidator(validateJob, {
      ...goodJob,
      requiredSkills: [],
    });

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("rejects an unknown job type", () => {
    const { res } = runValidator(validateJob, { ...goodJob, type: "Pirate" });

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe("validateObjectId", () => {
  test("rejects an ID in the wrong format", () => {
    const res = fakeResponse();
    const next = jest.fn();

    validateObjectId("id")({ params: { id: "123" } }, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});
