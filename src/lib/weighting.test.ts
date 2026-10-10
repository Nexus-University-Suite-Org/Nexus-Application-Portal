import { describe, it, expect } from "vitest";
import {
  computeWeight,
  recommendPrograms,
  subjectCategory,
  oLevelPoints,
  aLevelGradePoints,
  type WeightInput,
} from "@/lib/weighting";
import type { NadProgram } from "@/lib/nadPrograms";

const cs: NadProgram = {
  programCode: "BSC-CS",
  programName: "Bachelor of Science in Computer Science",
  cutoffScore: 21,
  essentialSubjects: "English Language (UCE O-level, credit or better)",
  relevantSubjects:
    "Mathematics; Physics or Information and Communication Technology; one science subject such as Chemistry or Biology",
  desirableSubjects: "Further Mathematics; Computer Studies; Practical Computer Skills",
  minimumUcePasses: 5,
};

describe("weighting", () => {
  it("maps grades and O-level points", () => {
    expect(aLevelGradePoints("A")).toBe(6);
    expect(aLevelGradePoints("E")).toBe(2);
    expect(aLevelGradePoints("F")).toBe(0);
    expect(oLevelPoints("D1")).toBeCloseTo(0.3);
    expect(oLevelPoints("4")).toBeCloseTo(0.2);
    expect(oLevelPoints("8")).toBeCloseTo(0.1);
    expect(oLevelPoints("9")).toBe(0);
  });

  it("classifies subjects by programme lists", () => {
    expect(subjectCategory(cs, "Mathematics").category).toBe("Relevant");
    expect(subjectCategory(cs, "Physics").category).toBe("Relevant");
    expect(subjectCategory(cs, "Further Mathematics").category).toBe("Desirable");
    expect(subjectCategory(cs, "Chemistry").category).toBe("Relevant");
    expect(subjectCategory(cs, "History").category).toBe("Other");
  });

  it("computes A-Level + O-Level + female bonus", () => {
    const input: WeightInput = {
      principal: [
        { subject: "Mathematics", grade: "A" },
        { subject: "Physics", grade: "B" },
        { subject: "Chemistry", grade: "C" },
      ],
      subsidiaries: [{ subject: "General Paper", grade: "C" }],
      oLevel: Array.from({ length: 8 }, () => ({ subject: "Mathematics", grade: "2" })),
      gender: "Female",
    };
    const r = computeWeight(input, cs);
    // A-level principals: 6*2 + 5*2 + 4*2 = 30; GP other 4*0.5 = 2 => 32
    expect(r.aLevelWeight).toBeCloseTo(32);
    // 8 x 0.3 = 2.4
    expect(r.oLevelWeight).toBeCloseTo(2.4);
    expect(r.genderBonus).toBeCloseTo(1.5);
    expect(r.adjusted).toBeCloseTo(35.9);
    expect(r.qualified).toBe(true);
    expect(r.margin).toBeCloseTo(14.9);
  });

  it("filters and ranks programmes", () => {
    const low: NadProgram = { ...cs, programCode: "X", programName: "Reach", cutoffScore: 100 };
    const input: WeightInput = {
      principal: [{ subject: "History", grade: "E" }],
      subsidiaries: [],
      oLevel: [{ subject: "History", grade: "5" }],
      gender: "Male",
    };
    const ranked = recommendPrograms(input, [cs, low]);
    expect(ranked[0].program.programCode).toBe("BSC-CS");
    expect(ranked[1].band).toBe("Reach");
  });
});
