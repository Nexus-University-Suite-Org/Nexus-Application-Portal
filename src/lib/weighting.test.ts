import { describe, it, expect } from "vitest";
import {
  aLevelEssentials,
  computeWeight,
  recommendPrograms,
  subjectCategory,
  oLevelPoints,
  aLevelGradePoints,
  subsidiaryGradeOptions,
  isWeightQuery,
  type WeightInput,
} from "@/lib/weighting";
import type { NadProgram } from "@/lib/nadPrograms";

const cs: NadProgram = {
  programCode: "BSC-CS",
  programName: "Bachelor of Science in Computer Science",
  cutoffScore: 21,
  essentialSubjects:
    "English Language (UCE O-level, credit or better); Mathematics (UCE O-level, credit or better)",
  relevantSubjects:
    "Mathematics; Physics or Information and Communication Technology; one science subject such as Chemistry or Biology",
  desirableSubjects: "Further Mathematics; Computer Studies; Practical Computer Skills",
  minimumUcePasses: 5,
};

const bcom: NadProgram = {
  programCode: "BCOM-ACC",
  programName: "Bachelor of Commerce in Accounting",
  cutoffScore: 46,
  essentialSubjects:
    "English Language (UCE O-level, credit or better); Mathematics (UCE O-level, credit or better)",
  relevantSubjects: "Mathematics; Commerce; Financial Accounting; Economics; Business Administration",
  desirableSubjects: "Computer Studies; Principles of Accounts; Entrepreneurship",
  minimumUcePasses: 5,
};

const nursing: NadProgram = {
  programCode: "BSC-NUR",
  programName: "Bachelor of Science in Nursing Science",
  cutoffScore: 24,
  essentialSubjects:
    "English Language (UCE O-level, credit or better); Biology (UCE O-level, credit or better); Chemistry or Mathematics (UCE O-level, pass or better)",
  relevantSubjects: "Biology; Chemistry; Mathematics or Physics or Computer Studies; one science subject",
  desirableSubjects: "Computer Studies; Physical Education; Christian Religious Education",
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

  it("strips UCE/O-Level entries from A-Level subject categories", () => {
    // The NAD essential list is O-Level only -> the override supplies the
    // real A-Level essentials, and English (UCE) must not leak through.
    expect(aLevelEssentials(cs)).toEqual(["Mathematics"]);
    expect(aLevelEssentials(cs)).not.toContain("English Language");
    expect(aLevelEssentials(nursing)).toEqual(["Biology", "Chemistry"]);
  });

  it("classifies A-Level subjects by programme lists", () => {
    expect(subjectCategory(cs, "Mathematics")).toEqual({ category: "Essential", weight: 3 });
    expect(subjectCategory(cs, "Physics").category).toBe("Relevant");
    expect(subjectCategory(cs, "Further Mathematics").category).toBe("Desirable");
    expect(subjectCategory(cs, "Chemistry").category).toBe("Relevant");
    expect(subjectCategory(cs, "History")).toEqual({ category: "Other", weight: 0 });
    expect(subjectCategory(bcom, "Mathematics")).toEqual({ category: "Essential", weight: 3 });
    expect(subjectCategory(bcom, "Economics")).toEqual({ category: "Essential", weight: 3 });
    expect(subjectCategory(bcom, "Entrepreneurship").category).toBe("Desirable");
  });

  it("reproduces the BCOM example: (6x3+5x3)+(6x2)+subsidiary 1.0 = 46.0", () => {
    const input: WeightInput = {
      principal: [
        { subject: "Mathematics", grade: "A" }, // Essential x3 -> 18
        { subject: "Economics", grade: "B" }, // Essential x3 -> 15
        { subject: "Commerce", grade: "A" }, // Relevant x2 -> 12
      ],
      subsidiaries: [{ subject: "General Paper", grade: "3" }], // numeric pass -> +1.0
      oLevel: [],
      gender: "Male",
    };
    const r = computeWeight(input, bcom);
    expect(r.aLevelWeight).toBeCloseTo(45);
    expect(r.subsidiaryPoints).toBeCloseTo(1);
    expect(r.total).toBeCloseTo(46);
    expect(r.adjusted).toBeCloseTo(46);
    expect(r.qualified).toBe(true);
    expect(r.margin).toBeCloseTo(0);
    expect(r.ineligible).toBe(false);
  });

  it("keeps O-Level as a decoupled lump (max 2.4), never categorised", () => {
    const input: WeightInput = {
      principal: [{ subject: "Physics", grade: "C" }], // Relevant x2 -> 8
      subsidiaries: [],
      oLevel: Array.from({ length: 8 }, () => ({ subject: "Mathematics", grade: "2" })),
      gender: "Female",
    };
    const r = computeWeight(input, cs);
    expect(r.aLevelWeight).toBeCloseTo(8);
    expect(r.oLevelWeight).toBeCloseTo(2.4);
    // The O-Level rows only contribute through the lump; none are categorised.
    expect(r.breakdown.filter((b) => b.category === "Essential")).toHaveLength(0);
    expect(r.breakdown.filter((b) => b.category === "Relevant").map((b) => b.subject)).toEqual([
      "Physics",
    ]);
  });

  it("flags implausible (old raw scale) cut-offs as Review instead of comparing", () => {
    const input: WeightInput = {
      principal: [{ subject: "Mathematics", grade: "A" }],
      subsidiaries: [],
      oLevel: [],
      gender: "Male",
    };
    const r = computeWeight(input, cs); // cutoff 21 < MIN_PLAUSIBLE_CUTOFF
    expect(r.qualified).toBe(false);
    expect(r.cutoffPlausible).toBe(false);
    const ranked = recommendPrograms(input, [cs]);
    expect(ranked[0].band).toBe("Review");
  });

  it("renders Nursing ineligible without A-Level Biology and Chemistry", () => {
    const strongButNoSciences: WeightInput = {
      principal: [
        { subject: "Mathematics", grade: "A" },
        { subject: "Physics", grade: "A" },
        { subject: "Computer Studies", grade: "A" },
      ],
      subsidiaries: [{ subject: "General Paper", grade: "1" }],
      oLevel: [],
      gender: "Male",
    };
    const r = computeWeight(strongButNoSciences, nursing);
    expect(r.aLevelWeight).toBeGreaterThan(30); // very high score
    expect(r.ineligible).toBe(true);
    expect(r.missingEssentials).toContain("Biology");
    expect(r.missingEssentials).toContain("Chemistry");
    expect(r.qualified).toBe(false);
    const ranked = recommendPrograms(strongButNoSciences, [nursing]);
    expect(ranked[0].band).toBe("Ineligible");
  });

  it("keeps Nursing eligible when Biology and Chemistry are present", () => {
    const input: WeightInput = {
      principal: [
        { subject: "Biology", grade: "A" }, // Essential x3 -> 18
        { subject: "Chemistry", grade: "B" }, // Essential x3 -> 15
        { subject: "Mathematics", grade: "C" }, // Relevant x2 -> 8
      ],
      subsidiaries: [],
      oLevel: [],
      gender: "Male",
    };
    const r = computeWeight(input, nursing);
    expect(r.ineligible).toBe(false);
    expect(r.missingEssentials).toEqual([]);
    expect(r.aLevelWeight).toBeCloseTo(41);
  });

  it("scores a failed subsidiary as 0 and unlisted principals as not counted", () => {
    const input: WeightInput = {
      principal: [{ subject: "History", grade: "A" }], // Other -> weight 0
      subsidiaries: [{ subject: "General Paper", grade: "9" }], // numeric fail -> 0
      oLevel: [],
      gender: "Male",
    };
    const r = computeWeight(input, cs);
    expect(r.aLevelWeight).toBeCloseTo(0);
    expect(r.subsidiaryPoints).toBeCloseTo(0);
  });

  it("grades General Paper and ICT on the numeric 1-9 scale", () => {
    expect(subsidiaryGradeOptions).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9"]);
    for (const pass of ["1", "2", "3", "4", "5", "6"]) {
      const r = computeWeight(
        { principal: [], subsidiaries: [{ subject: "General Paper", grade: pass }], oLevel: [], gender: "Male" },
        cs,
      );
      expect(r.subsidiaryPoints, `grade ${pass}`).toBeCloseTo(1);
    }
    for (const fail of ["7", "8", "9"]) {
      const r = computeWeight(
        { principal: [], subsidiaries: [{ subject: "ICT", grade: fail }], oLevel: [], gender: "Male" },
        cs,
      );
      expect(r.subsidiaryPoints, `grade ${fail}`).toBeCloseTo(0);
      expect(r.breakdown[0].category).toBe("Subsidiary (fail)");
    }
  });

  it("filters and ranks programmes", () => {
    const low: NadProgram = { ...cs, programCode: "X", programName: "Reach", cutoffScore: 100 };
    const input: WeightInput = {
      principal: [{ subject: "Mathematics", grade: "A" }],
      subsidiaries: [],
      oLevel: [{ subject: "History", grade: "5" }],
      gender: "Male",
    };
    const ranked = recommendPrograms(input, [cs, low]);
    // low has a plausible cutoff far above the score (Reach); cs has an
    // implausible cutoff (Review).
    expect(ranked.map((r) => r.band)).toEqual(["Reach", "Review"]);
    expect(ranked[0].program.programCode).toBe("X");
  });
});

describe("isWeightQuery", () => {
  it("matches natural admissions-weight phrasing", () => {
    [
      "hello can you calculate my weights",
      "can you calculate my weights please",
      "what is my admission weight?",
      "what is my cut off",
      "help me work out my weighted score",
      "which programme fits me",
      "which programmes can i apply for",
      "what can I apply for",
      "recommend a course for me",
      "do i qualify for computer science",
      "am i eligible for law",
      "which course should i do",
    ].forEach((q) => expect(isWeightQuery(q), q).toBe(true));
  });

  it("leaves general questions for the normal chat flow", () => {
    [
      "How do I apply?",
      "What programs do you offer?",
      "What are the tuition fees and are there scholarships?",
      "How can I contact the admissions office?",
      "hello",
      "tell me about the campus",
      "when do applications open",
      "what courses do you offer",
      "i qualify for a scholarship",
    ].forEach((q) => expect(isWeightQuery(q), q).toBe(false));
  });
});