import { describe, it, expect } from "vitest";
import { shouldSuggest, suggestFor } from "@/lib/chatSuggestions";

describe("shouldSuggest", () => {
  it("offers related questions for fallback answers", () => {
    const out = shouldSuggest(
      "How much are the tuition fees?",
      "I couldn't find that in our information yet. The admissions office can give you an accurate answer.",
    );
    expect(out.length).toBeGreaterThan(0);
    expect(out.some((s) => /tuition|scholarship/i.test(s.query))).toBe(true);
  });

  it("offers suggestions for the canned capability reply", () => {
    const out = shouldSuggest(
      "what programmes do you have",
      "I can help with programmes offered, how to apply, entry requirements, tuition and fees, scholarships. What would you like to know?",
    );
    expect(out.length).toBeGreaterThan(0);
    expect(out[0].query).toBe("What programs do you offer?");
  });

  it("offers nothing for a real answer", () => {
    expect(
      shouldSuggest("Which programs do you offer?", "We offer a Bachelor of Science in Computer Science."),
    ).toEqual([]);
  });

  it("caps at three suggestions", () => {
    expect(
      suggestFor("how do I apply, what are the tuition fees and scholarships, contact the office"),
    ).toHaveLength(3);
  });

  it("returns default suggestions when nothing matches", () => {
    expect(suggestFor("mystery query something")).toHaveLength(3);
  });
});