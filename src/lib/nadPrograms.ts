import { nadApiUrl } from "@/lib/apiUrl";

export interface NadProgram {
  id?: number;
  programCode: string;
  programName: string;
  programType?: string;
  facultySchool?: string;
  status?: string;
  cutoffScore?: number;
  essentialSubjects?: string;
  relevantSubjects?: string;
  desirableSubjects?: string;
  minimumUcePasses?: number;
  awardQualification?: string;
}

let cache: NadProgram[] | null = null;
let inflight: Promise<NadProgram[]> | null = null;

/**
 * Fetches the live programme catalogue from the Nexus Admissions Dashboard
 * (NAD) public API. The result is cached for the page session so the wizard
 * and any future callers share one fetch.
 */
export async function fetchActivePrograms(): Promise<NadProgram[]> {
  if (cache) return cache;
  if (inflight) return inflight;

  inflight = (async () => {
    const res = await fetch(nadApiUrl("public/programs"));
    if (!res.ok) {
      throw new Error(`NAD programs request failed with ${res.status}`);
    }
    const data = (await res.json()) as NadProgram[];
    const active = data
      .filter((p) => !p.status || String(p.status).toLowerCase() === "active")
      .map((p) => {
        const normalized: NadProgram = { ...p };
        if (typeof normalized.cutoffScore !== "number") {
          normalized.cutoffScore = Number(normalized.cutoffScore ?? 0);
        }
        if (isNaN(normalized.cutoffScore)) normalized.cutoffScore = 0;
        return normalized;
      })
      .filter((p) => p && p.programCode && p.programName);
    cache = active;
    return active;
  })()
    .catch((err) => {
      cache = null;
      throw err;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function clearProgramCache() {
  cache = null;
}