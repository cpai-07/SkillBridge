const { computeMatch, cleanList } = require("../src/utils/match");

describe("cleanList", () => {
  test("lowercases, trims and removes duplicates", () => {
    expect(cleanList(["  React ", "react", "REACT"])).toEqual(["react"]);
  });

  test("turns short names into one common name", () => {
    expect(cleanList(["JS", "node", "ReactJS"])).toEqual([
      "javascript",
      "node.js",
      "react",
    ]);
  });
});

describe("computeMatch", () => {
  test("gives 75% when 3 of 4 required skills match", () => {
    const result = computeMatch(
      ["React", "JS", "node"],
      ["react", "JavaScript", "Node.js", "MongoDB"],
    );

    expect(result.score).toBe(75);
    expect(result.missing).toEqual(["mongodb"]);
  });

  test("gives 0% when the candidate has no skills", () => {
    expect(computeMatch([], ["react"]).score).toBe(0);
  });

  test("gives 0% when the job has no required skills", () => {
    expect(computeMatch(["react"], []).score).toBe(0);
  });

  test("gives 100% when every skill matches", () => {
    expect(computeMatch(["react", "git"], ["git", "react"]).score).toBe(100);
  });
});
