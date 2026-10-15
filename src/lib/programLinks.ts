import { nadApiUrl } from "@/lib/apiUrl";

/**
 * Resolves a NAD programme to its site detail route.
 *
 * The applicant portal renders programme detail pages from the NAD public
 * catalogue, so the id carried by a NAD programme is the same id used in
 * `/programs/:id`. This module builds a code/name -> id lookup from that
 * catalogue so chat recommendations and sources (which may only carry a code)
 * can deep-link, falling back to the listing when the lookup misses.
 */

type CmsProgram = {
  id?: number;
  programCode?: string;
  programName?: string;
};

const normaliseCode = (value: string | undefined) =>
  (value ?? "").trim().toUpperCase();

const normaliseName = (value: string | undefined) =>
  (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

let codeMap: Map<string, number> | null = null;
let nameMap: Map<string, number> | null = null;
let inflight: Promise<void> | null = null;

/** Fetches the NAD programme catalogue once and builds the lookup maps. */
export async function loadProgramLinks(): Promise<void> {
  if (codeMap) return;
  if (inflight) return inflight;

  inflight = (async () => {
    const codes = new Map<string, number>();
    const names = new Map<string, number>();
    try {
      const res = await fetch(nadApiUrl("public/programs"));
      if (res.ok) {
        const data = (await res.json()) as CmsProgram[];
        for (const program of Array.isArray(data) ? data : []) {
          if (typeof program.id !== "number") continue;
          const code = normaliseCode(program.programCode);
          if (code && !codes.has(code)) codes.set(code, program.id);
          const name = normaliseName(program.programName);
          if (name && !names.has(name)) names.set(name, program.id);
        }
      }
    } catch {
      /* offline / backend unavailable: fall back to listing links */
    } finally {
      codeMap = codes;
      nameMap = names;
      inflight = null;
    }
  })();

  return inflight;
}

/** Resolves a NAD programme (by code, then name) to its site id. */
export function programIdFor(
  programCode?: string,
  programName?: string,
): number | undefined {
  const code = normaliseCode(programCode);
  if (code && codeMap?.has(code)) return codeMap.get(code);
  const name = normaliseName(programName);
  if (name && nameMap?.has(name)) return nameMap.get(name);
  return undefined;
}

export function clearProgramLinkCache() {
  codeMap = null;
  nameMap = null;
}

export const PROGRAMS_LISTING = "/programs";

export const programPath = (id: number) => `/programs/${id}`;

/**
 * The "read more" destination for a chat source, keyed by the collection the
 * ML service reports. Programmes deep-link to their detail page; collections
 * without a per-record route (or whose slug is not carried in the source
 * metadata) fall back to their listing page.
 */
export function sourcePath(
  collection?: string,
  entityId?: string | number,
): string | null {
  const id = entityId != null ? String(entityId) : "";
  const numeric = /^\d+$/.test(id);

  switch (collection) {
    case "programs":
      return numeric ? programPath(Number(id)) : PROGRAMS_LISTING;
    case "courses":
      return PROGRAMS_LISTING;
    case "news":
    case "events":
      return "/news";
    case "student_stories":
    case "alumni":
      return "/stories";
    case "quick_links":
      return "/quick-links";
    default:
      return null;
  }
}
