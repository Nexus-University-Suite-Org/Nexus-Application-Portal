import { fetchActivePrograms, type NadProgram } from "@/lib/nadPrograms";

/**
 * Uganda public-university admission weighting, kept in step with
 * NAP-Backend's `WeightingService` so student-facing guidance and the admin
 * review scorer agree.
 *
 *   A-Level (principals only): grade points (A=6 … F=0, O=1) × the subject's
 *       category weight (Essential ×3, Relevant ×2, Desirable ×1; unlisted 0).
 *   Subsidiary (General Paper etc.): a flat +1.0 per passed subject — never
 *       multiplied by grade points or category.
 *   O-Level (UCE): a separate, decoupled lump from the best 8 subjects
 *       (D1/D2→0.3, Credit/C/3-6→0.2, Pass/P/7-8→0.1), capped at 2.4.
 *       O-Level subjects are NEVER counted under Essential/Relevant/Desirable.
 *   Female: +1.5 affirmative-action bonus.
 *   Cut-offs come from the NAD per programme. A cut-off far below the weighted
 *       scale (stale raw-scale values like 21/19) is flagged as "Review" rather
 *       than being compared directly against the weighted score.
 *
 * NAD subject lists mix O-Level/UCE entries (e.g. "English Language (UCE
 * O-level, credit or better)") with true A-Level requirements. Those UCE
 * entries are stripped before weighting or display. Where NAD omits the real
 * A-Level Essentials (it currently lists them only in UCE context), a curated
 * map supplies them until the NAD records are corrected.
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
  /** Weighted A-Level principal score only ((Essential×3)+(Relevant×2)+(Desirable×1)). */
  aLevelWeight: number;
  /** Flat subsidiary contribution (+1.0 per passed subject). */
  subsidiaryPoints: number;
  /** O-Level best-8 lump (max 2.4), never categorised per programme. */
  oLevelWeight: number;
  genderBonus: number;
  total: number;
  adjusted: number;
  /** NAD published cut-off for the programme (from the dashboard, never hardcoded per programme). */
  cutoff: number;
  /** Whether `cutoff` sits on the weighted scale; implausible values → "Review" band. */
  cutoffPlausible: boolean;
  qualified: boolean;
  margin: number;
  oLevelPasses: number;
  meetsUcePasses: boolean;
  ineligible: boolean;
  missingEssentials: string[];
  breakdown: SubjectScoreDetail[];
}

export type ProgramBand = "Qualified" | "Close" | "Reach" | "Review" | "Ineligible";

export interface ProgramRecommendation extends WeightResult {
  band: ProgramBand;
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

export const subsidiarySubjectOptions = ["General Paper", "Subsidiary Mathematics", "ICT"];

export const GENDER_BONUS = 1.5;
export const SUBSIDIARY_FLAT_POINTS = 1.0;
export const O_LEVEL_LUMP_MAX = 2.4;
/** Minimum plausible weighted cut-off; anything below is treated as an old raw-scale value. */
export const MIN_PLAUSIBLE_CUTOFF = 30.0;
/** Margin (on the weighted scale) below which a near-miss counts as "Close". */
export const CLOSE_MARGIN = 3.0;

export const CATEGORY_WEIGHTS = { Essential: 3, Relevant: 2, Desirable: 1, Other: 0 } as const;

/**
 * Real A-Level Essential subjects per programme, used when the NAD records
 * list them only in UCE context (or omit them entirely). The NAD
 * essentialSubjects field currently carries O-Level requirements only, so the
 * ×3 tier would otherwise never apply. Overrides are applied in front of the
 * NAD data and should be removed as the NAD records are corrected.
 */
export const A_LEVEL_ESSENTIAL_OVERRIDES: Record<string, string[]> = {
  "BCOM-ACC": ["Mathematics", "Economics"],
  "BSC-CS": ["Mathematics"],
  "BSC-NUR": ["Biology", "Chemistry"],
};

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

/**
 * Drops O-Level/UCE segments from a NAD subject list, leaving only the
 * A-Level (UACE) requirements. Segments like "English Language (UCE O-level,
 * credit or better)" are O-Level context and must never feed A-Level
 * categorisation.
 */
export function cleanListText(text: string | undefined): string {
  if (!text) return "";
  return text
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s && !/uce|o\s*-?\s*level/i.test(s) && s !== "")
    .join("; ")
    .trim();
}

/** Returns the O-Level/UCE subject names listed in a NAD subject list (for display). */
export function uceSubjectNames(text: string | undefined): string[] {
  if (!text) return [];
  return text
    .split(";")
    .map((s) => s.trim())
    .filter((s) => /uce|o\s*-?\s*level/i.test(s))
    .map((s) => s.replace(/\([^)]*\)/g, "").trim())
    .filter(Boolean);
}

const tokenizeSubjectList = (text: string) =>
  text
    .split(/\s*;\s*|\s*,\s*|\s+or\s+/i)
    .map((s) => s.trim())
    .filter(Boolean);

/** Effective A-Level Essential subject set for a programme (override or cleaned NAD data). */
export function aLevelEssentials(program: NadProgram): string[] {
  const override = A_LEVEL_ESSENTIAL_OVERRIDES[program.programCode];
  if (override) return override;
  return tokenizeSubjectList(cleanListText(program.essentialSubjects));
}

export function aLevelRelevantText(program: NadProgram): string {
  return cleanListText(program.relevantSubjects);
}

export function aLevelDesirableText(program: NadProgram): string {
  return cleanListText(program.desirableSubjects);
}

export function subjectCategory(
  program: NadProgram,
  subject: string,
): { category: string; weight: number } {
  if (aLevelEssentials(program).some((ess) => subjectListed(subject, ess))) {
    return { category: "Essential", weight: CATEGORY_WEIGHTS.Essential };
  }
  if (subjectListed(subject, aLevelRelevantText(program))) {
    return { category: "Relevant", weight: CATEGORY_WEIGHTS.Relevant };
  }
  if (subjectListed(subject, aLevelDesirableText(program))) {
    return { category: "Desirable", weight: CATEGORY_WEIGHTS.Desirable };
  }
  return { category: "Other", weight: CATEGORY_WEIGHTS.Other };
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

/**
 * Weighted A-Level principal score plus flat subsidiary contribution, with a
 * per-subject breakdown. Principals are categorised (Essential ×3, Relevant
 * ×2, Desirable ×1, unlisted 0); subsidiaries score a flat +1.0 per pass.
 */
function aLevelWeight(
  principal: SubjectGrade[],
  subsidiaries: SubjectGrade[],
  program: NadProgram,
) {
  const breakdown: SubjectScoreDetail[] = [];
  let principalWeight = 0;
  let subsidiaryPoints = 0;

  for (const entry of principal.filter((s) => s.subject && s.grade)) {
    const gradePoints = aLevelGradePoints(entry.grade);
    const { category, weight } = subjectCategory(program, entry.subject);
    const contributed = round(gradePoints * weight);
    principalWeight += contributed;
    breakdown.push({
      subject: entry.subject,
      grade: entry.grade.trim().toUpperCase(),
      category,
      gradePoints,
      weight,
      contributed,
    });
  }

  for (const entry of subsidiaries.filter((s) => s.subject && s.grade)) {
    const gradePoints = aLevelGradePoints(entry.grade);
    const passed = gradePoints > 0;
    const contributed = passed ? SUBSIDIARY_FLAT_POINTS : 0;
    subsidiaryPoints += contributed;
    breakdown.push({
      subject: entry.subject,
      grade: entry.grade.trim().toUpperCase(),
      category: passed ? "Subsidiary" : "Subsidiary (fail)",
      gradePoints,
      weight: SUBSIDIARY_FLAT_POINTS,
      contributed,
    });
  }

  return {
    principalWeight: round(principalWeight),
    subsidiaryPoints: round(subsidiaryPoints),
    breakdown,
  };
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

function missingAlevelEssentials(principal: SubjectGrade[], program: NadProgram): string[] {
  return aLevelEssentials(program).filter(
    (ess) => !principal.some((p) => p.subject && subjectListed(p.subject, ess)),
  );
}

/** Computes the full weight for one programme from the student's grades. */
export function computeWeight(input: WeightInput, program: NadProgram): WeightResult {
  const {
    principalWeight,
    subsidiaryPoints,
    breakdown,
  } = aLevelWeight(input.principal, input.subsidiaries, program);
  const oLevelWeightValue = oLevelWeight(input.oLevel);
  const genderBonus = input.gender === "Female" ? GENDER_BONUS : 0;
  const total = round(principalWeight + subsidiaryPoints + oLevelWeightValue);
  const adjusted = round(total + genderBonus);
  const cutoff =
    typeof program.cutoffScore === "number"
      ? program.cutoffScore
      : Number(program.cutoffScore ?? 0) || 0;
  const missingEssentials = missingAlevelEssentials(input.principal, program);
  const ineligible = missingEssentials.length > 0;
  const cutoffPlausible = cutoff >= MIN_PLAUSIBLE_CUTOFF;
  const qualified = !ineligible && cutoffPlausible && adjusted >= cutoff;
  const margin = round(adjusted - cutoff);
  const passes = oLevelPasses(input.oLevel);
  const meetsUcePasses = !program.minimumUcePasses || passes >= program.minimumUcePasses;

  return {
    program,
    aLevelWeight: principalWeight,
    subsidiaryPoints,
    oLevelWeight: oLevelWeightValue,
    genderBonus,
    total,
    adjusted,
    cutoff,
    cutoffPlausible,
    qualified,
    margin,
    oLevelPasses: passes,
    meetsUcePasses,
    ineligible,
    missingEssentials,
    breakdown,
  };
}

/**
 * Ranks the current NAD catalogue for the student's weight: programmes meeting
 * their cut-off first (by slack), then near-misses, then reaches, then
 * programmes whose cut-off is implausible ("Review"), then ineligible ones.
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
    band: (r.ineligible
      ? "Ineligible"
      : !r.cutoffPlausible
        ? "Review"
        : r.margin >= 0
          ? "Qualified"
          : r.margin >= -CLOSE_MARGIN
            ? "Close"
            : "Reach") as ProgramBand,
  }));

  const order: Record<ProgramBand, number> = {
    Qualified: 0,
    Close: 1,
    Reach: 2,
    Review: 3,
    Ineligible: 4,
  };
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

/**
 * Natural-language detection for the admission-weight calculator. Tolerant
 * patterns (plurals, "calc", "which course should I do") so casual phrasing
 * like "hello can you calculate my weights" opens the wizard, while general
 * questions ("what programmes do you offer") still fall through to chat.
 */
export const weightIntentPatterns: RegExp[] = [
  /\badmission\s+weights?\b/i,
  /\bcut\s*-?\s*off\b/i,
  /\bmy\s+(weights?|points?|scores?|marks?|aggregates?)\b/i,
  /\bweighted?\s+(score|scores|points?|marks?|aggregate)\b/i,
  /\b(calculate|compute|calc|work\s*out|figure\s*out|determine|evaluate|check|find|tell\s+me|know)\b[^.?]*\b(weight|point|score|mark|aggregate)s?\b/i,
  /\bwhat('?s|\s+is)\s+my\s+(weight|points?|score|marks?|aggregate)\b/i,
  /\b(which|what)\s+(program|programme|course|degree|field)s?\b[^.?]*\b(fit|suit|qualif|appl|best|can\s+i|should\s+i|do\s+i)\w*/i,
  /\brecommend\b[^.?]*\b(program|programme|course|degree|study|field)\w*/i,
  /\bwhat\s+(can|could|should)\s+i\s+(apply|qualif|study|do)\b/i,
  /\b(do|can|will|would)\s+i\s+(qualif|get\s+in|be\s+accepted|meet)\w*/i,
  /\bam\s+i\s+(eligible|qualified)\b/i,
  /\b(program|programme|course|degree)\s+(recommendation|recommender|match|matches)\b/i,
];

export const isWeightQuery = (text: string) =>
  weightIntentPatterns.some((re) => re.test(text));