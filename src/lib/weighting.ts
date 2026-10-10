import { fetchActivePrograms, type NadProgram } from "@/lib/nadPrograms";

/**
 * Uganda public-university admission weighting, kept in step with
 * NAP-Backend's `WeightingService` so student-facing guidance and the admin
 * review scorer agree.
 *
 *   A-Level: grade points (A=6 … F=0, O=1) multiplied by the subject's
 *       category weight (Essential 3, Relevant 2, Desirable 1, Other 0.5).
 *   O-Level: best 8 subjects, D1/D2→0.3, Credit/C/3-6→0.2, Pass/P/7-8→0.1.
 *   Female:  +1.5 affirmative-action bonus.
 */

export interface SubjectGrade {
  subject: string;
  grade: string;
}

export interface WeightInput {
  principal: SubjectGrade[];
  subsidiaries: SubjectGrade[];
  oLevel: SubjectGrade[];
  gender: "" | "Male" | "Female" | "Other";
}

export interface SubjectScoreDetail {
  subject: string;
  grade: string;
  category: string;
  gradePoints: number;
  weight: number;
  contributed: number;
}

export interface WeightResult {
  program: NadProgram;
  aLevelWeight: number;
  oLevelWeight: number;
  genderBonus: number;
  total: number;
  adjusted: number;
  qualified: boolean;
  margin: number;
  oLevelPasses: number;
  meetsUcePasses: boolean;
  breakdown: SubjectScoreDetail[];
}

export interface ProgramRecommendation extends WeightResult {
  band: "Qualified" | "Close" | "Reach";
}

export const uacePrincipalGradeOptions = ["A", "B", "C", "D", "E"];
export const subsidiaryGradeOptions = ["A", "B", "C", "D", "E", "O", "F"];
export const oLevelGradeOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export const uaceSubjectOptions = [
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
  "Economics",
  "History",
  "Geography",
  "Literature in English",
  "Christian Religious Education",
  "Islamic Religious Education",
  "Divinity",
  "Entrepreneurship",
  "Computer Studies",
  "Further Mathematics",
  "Fine Art",
  "Agriculture",
  "Kiswahili",
  "French",
  "Luganda",
];

export const oLevelSubjectOptions = [
  "English Language",
  "Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
  "Geography",
  "History",
  "Christian Religious Education",
  "Islamic Religious Education",
  "Fine Art",
  "Commerce",
  "Agriculture",
  "Entrepreneurship",
  "Computer Studies",
  "Literature in English",
  "Luganda",
  "French",
  "Kiswahili",
];

export const subsidiarySubjectOptions = [
  "General Paper",
  "Subsidiary Mathematics",
  "ICT",
];

export const GENDER_BONUS = 1.5;

const A_LEVEL_GRADE_POINTS: Record<string, number> = {
  A: 6,
  B: 5,
  C: 4,
  D: 3,
  E: 2,
  O: 1,
  F: 0,
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** A fully-contextual word match (e.g. "Mathematics" vs "Subsidiary Mathematics"). */
const hasWord = (text: string, word: string) =>
  new RegExp(`(^|\\W)${escapeRegex(word)}(\\W|$)`).test(text);

/** Whether `subject` is named in a NAD subject-list string. */
export function subjectListed(subject: string, listText: string | undefined): boolean {
  if (!listText) return false;
  const subj = subject.trim();
  if (!subj) return false;

  const normalizedSubject = normalize(subj);
  const normalizedText = normalize(listText);

  // ICT is written out in full on some programme records.
  if (/^information( and|&)? communication( and|&)? technology$/.test(normalizedSubject)) {
    if (hasWord(normalizedText, "ict")) return true;
  }
  if (normalizedSubject === "ict") {
    if (/information.*communication.*technology/.test(normalizedText)) return true;
  }

  const tokens = normalizedSubject.split(" ").filter(Boolean);
  // Multi-word subjects must appear as a whole phrase.
  if (tokens.length >= 2) {
    return tokens.every((t) => hasWord(normalizedText, t));
  }
  return hasWord(normalizedText, tokens[0] ?? "");
}

export function subjectCategory(
  program: NadProgram,
  subject: string,
): { category: string; weight: number } {
  if (subjectListed(subject, program?.essentialSubjects)) return { category: "Essential", weight: 3.0 };
  if (subjectListed(subject, program?.relevantSubjects)) return { category: "Relevant", weight: 2.0 };
  if (subjectListed(subject, program?.desirableSubjects)) return { category: "Desirable", weight: 1.0 };
  return { category: "Other", weight: 0.5 };
}

export function aLevelGradePoints(grade: string): number {
  const g = (grade ?? "").trim().toUpperCase();
  if (A_LEVEL_GRADE_POINTS[g] !== undefined) return A_LEVEL_GRADE_POINTS[g];
  const numeric = Number.parseInt(g, 10);
  if (!Number.isNaN(numeric)) return Math.max(0, 6 - (numeric - 1));
  return 0;
}

export function oLevelPoints(grade: string): number {
  const g = (grade ?? "").trim().toUpperCase();
  if (g.startsWith("D1") || g.startsWith("D2") || g === "1" || g === "2") return 0.3;
  if (g.startsWith("C") || ["3", "4", "5", "6"].includes(g)) return 0.2;
  if (g.startsWith("P") || ["7", "8"].includes(g)) return 0.1;
  return 0;
}

export function isOLevelPass(grade: string): boolean {
  return oLevelPoints(grade) > 0;
}

const round = (value: number) => Math.round(value * 10) / 10;

/** Weighted A-Level score against one programme, with a per-subject breakdown. */
function aLevelWeight(principal: SubjectGrade[], subsidiaries: SubjectGrade[], program: NadProgram) {
  const subjects: SubjectGrade[] = [
    ...principal.filter((s) => s.subject && s.grade),
    ...subsidiaries.filter((s) => s.subject && s.grade),
  ];
  const breakdown: SubjectScoreDetail[] = [];
  let total = 0;
  for (const entry of subjects) {
    const gradePoints = aLevelGradePoints(entry.grade);
    const { category, weight } = subjectCategory(program, entry.subject);
    const contributed = round(gradePoints * weight);
    total += contributed;
    breakdown.push({
      subject: entry.subject,
      grade: entry.grade.trim().toUpperCase(),
      category,
      gradePoints,
      weight,
      contributed,
    });
  }
  return { total: round(total), breakdown };
}

function oLevelWeight(subjects: SubjectGrade[]): number {
  const points = subjects
    .filter((s) => s.subject && s.grade)
    .map((s) => oLevelPoints(s.grade))
    .sort((a, b) => b - a)
    .slice(0, 8);
  return round(points.reduce((sum, p) => sum + p, 0));
}

function oLevelPasses(subjects: SubjectGrade[]): number {
  return subjects.filter((s) => s.subject && isOLevelPass(s.grade)).length;
}

/** Computes the full weight for one programme from the student's grades. */
export function computeWeight(input: WeightInput, program: NadProgram): WeightResult {
  const { total: aLevelWeightValue, breakdown } = aLevelWeight(
    input.principal,
    input.subsidiaries,
    program,
  );
  const oLevelWeightValue = oLevelWeight(input.oLevel);
  const genderBonus = input.gender === "Female" ? GENDER_BONUS : 0;
  const total = round(aLevelWeightValue + oLevelWeightValue);
  const adjusted = round(total + genderBonus);
  const cutoff = typeof program.cutoffScore === "number" ? program.cutoffScore : Number(program.cutoffScore ?? 0) || 0;
  const qualified = adjusted >= cutoff;
  const margin = round(adjusted - cutoff);
  const passes = oLevelPasses(input.oLevel);
  const meetsUcePasses = !program.minimumUcePasses || passes >= program.minimumUcePasses;

  return {
    program,
    aLevelWeight: aLevelWeightValue,
    oLevelWeight: oLevelWeightValue,
    genderBonus,
    total,
    adjusted,
    qualified,
    margin,
    oLevelPasses: passes,
    meetsUcePasses,
    breakdown,
  };
}

/**
 * Ranks the current NAD catalogue for the student's weight: programmes meeting
 * their cut-off first (by slack), then near-misses, then reaches.
 */
export function recommendPrograms(
  input: WeightInput,
  programs: NadProgram[],
): ProgramRecommendation[] {
  const results = programs
    .map((program) => computeWeight(input, program))
    .filter((r) => Number.isFinite(r.adjusted));

  const withBand = results.map((r) => ({
    ...r,
    band: (r.margin >= 0 ? "Qualified" : r.margin >= -1.5 ? "Close" : "Reach") as ProgramRecommendation["band"],
  }));

  const order = { Qualified: 0, Close: 1, Reach: 2 } as const;
  return [...withBand].sort(
    (a, b) =>
      order[a.band] - order[b.band] ||
      b.margin - a.margin ||
      (a.program.programName ?? "").localeCompare(b.program.programName ?? ""),
  );
}

export const formatScore = (value: number | undefined) =>
  `${Math.round((value ?? 0) * 10) / 10}`;

/** Live catalogue + ranking in one call, used by the chat wizard. */
export async function recommendFor(input: WeightInput): Promise<ProgramRecommendation[]> {
  const programs = await fetchActivePrograms();
  return recommendPrograms(input, programs);
}