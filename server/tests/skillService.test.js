const {
  extractSkills,
  findSkillsByKeyword,
} = require("../src/services/skillService");

const cvText =
  "Final year student. I built a web app with ReactJS, Node.js and MongoDB. " +
  "I use Git every day and I know JavaScript and SQL. I also wrote C++ at college.";

describe("keyword extraction (backup plan)", () => {
  test("finds skills and uses the common names", () => {
    const skills = findSkillsByKeyword(cvText);

    expect(skills).toEqual(
      expect.arrayContaining([
        "react",
        "node.js",
        "mongodb",
        "git",
        "javascript",
        "sql",
        "c++",
      ]),
    );
  });

  test("does not mistake java for javascript", () => {
    expect(findSkillsByKeyword("I like JavaScript")).not.toContain("java");
  });
});

describe("extractSkills", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
    global.fetch = originalFetch;
  });

  test("uses the keyword list when there is no API key", async () => {
    const result = await extractSkills(cvText);

    expect(result.source).toBe("keyword");
    expect(result.skills).toContain("react");
  });

  test("uses the AI answer when the API works", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [
          { type: "text", text: 'Here you go: ["ReactJS", "Teamwork"]' },
        ],
      }),
    });

    const result = await extractSkills(cvText);

    expect(result.source).toBe("ai");
    expect(result.skills).toEqual(["react", "teamwork"]);
  });

  test("falls back to keywords when the API fails", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
    jest.spyOn(console, "error").mockImplementation(() => {});

    const result = await extractSkills(cvText);

    expect(result.source).toBe("keyword");
    console.error.mockRestore();
  });
});
