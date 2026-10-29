import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  PROGRAMS_LISTING,
  clearProgramLinkCache,
  loadProgramLinks,
  programIdFor,
  programPath,
  sourcePath,
} from "@/lib/programLinks";

describe("sourcePath", () => {
  it("deep-links programmes that carry a numeric id", () => {
    expect(sourcePath("programs", 12)).toBe("/programs/12");
    expect(sourcePath("programs", "12")).toBe("/programs/12");
  });

  it("falls back to the listing when a programme id is missing or non-numeric", () => {
    expect(sourcePath("programs", undefined)).toBe(PROGRAMS_LISTING);
    expect(sourcePath("programs", "abc")).toBe(PROGRAMS_LISTING);
  });

  it("routes slug-less collections to their listing pages", () => {
    expect(sourcePath("courses", 5)).toBe(PROGRAMS_LISTING);
    expect(sourcePath("news", 3)).toBe("/news");
    expect(sourcePath("events", 3)).toBe("/news");
    expect(sourcePath("student_stories", 1)).toBe("/stories");
    expect(sourcePath("alumni", 1)).toBe("/stories");
    expect(sourcePath("quick_links", 2)).toBe("/quick-links");
  });

  it("returns null for collections with no page", () => {
    expect(sourcePath("faqs", 1)).toBeNull();
    expect(sourcePath(undefined, 1)).toBeNull();
  });
});

describe("program link map", () => {
  beforeEach(() => {
    clearProgramLinkCache();
    vi.restoreAllMocks();
  });

  it("joins NAD programmes to site ids by code and name", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => [
          {
            id: 11,
            programCode: "BSC-CS",
            programName: "Bachelor of Science in Computer Science",
          },
        ],
      })),
    );

    await loadProgramLinks();

    expect(programIdFor("bsc-cs")).toBe(11);
    expect(
      programIdFor(undefined, "Bachelor of Science in Computer Science"),
    ).toBe(11);
    expect(programPath(11)).toBe("/programs/11");
  });

  it("stays empty when the catalogue is empty", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => [] })),
    );

    await loadProgramLinks();

    expect(programIdFor("BSC-CS")).toBeUndefined();
  });

  it("survives a failed fetch", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      }),
    );

    await loadProgramLinks();

    expect(programIdFor("BSC-CS")).toBeUndefined();
  });
});
