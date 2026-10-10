/**
 * Curated follow-up suggestions for the chat assistant.
 *
 * When the assistant cannot answer a question directly (fallback / very short
 * reply), `shouldSuggest` offers up to three related questions derived from
 * the topic of the original question. The user picks one, and it is routed
 * through the normal chat flow (which also opens the weight wizard for
 * weight/eligibility queries).
 */

export interface Suggestion {
  label: string;
  query: string;
}

interface SuggestionGroup {
  pattern: RegExp;
  suggestions: Suggestion[];
}

const SUGGESTION_GROUPS: SuggestionGroup[] = [
  {
    pattern: /(fee|cost|tuition|scholarship|bursary|funding|financial|pay)/i,
    suggestions: [
      { label: "Tuition & scholarships", query: "What are the tuition fees and are there scholarships?" },
      { label: "How to pay", query: "How do I pay my tuition fees?" },
    ],
  },
  {
    pattern:
      /(admission|apply|application|deadline|intake|enrol|register|entry\s*requirements?|cut[\s-]*off|weight|point|score|qualif|eligible|grade)/i,
    suggestions: [
      { label: "How to apply", query: "How do I apply?" },
      { label: "Entry requirements", query: "What are the entry requirements?" },
      { label: "Calculate my admission weight", query: "Calculate my admission weight" },
    ],
  },
  {
    pattern: /(program|programme|course|degree|major|subject|offer|study)/i,
    suggestions: [{ label: "Programmes we offer", query: "What programs do you offer?" }],
  },
  {
    pattern: /(news|event|open\s*day|calendar)/i,
    suggestions: [{ label: "News & events", query: "What news and events are happening?" }],
  },
  {
    pattern: /(success|alumni|graduate|story|outcome)/i,
    suggestions: [
      { label: "Student success stories", query: "Tell me about student success stories" },
    ],
  },
  {
    pattern: /(contact|reach|phone|call|email|office|support|address)/i,
    suggestions: [
      { label: "Contact the admissions office", query: "How can I contact the admissions office?" },
    ],
  },
];

const DEFAULT_SUGGESTIONS: Suggestion[] = [
  { label: "Programmes we offer", query: "What programs do you offer?" },
  { label: "How to apply", query: "How do I apply?" },
  { label: "Tuition & scholarships", query: "What are the tuition fees and are there scholarships?" },
];

/** Replies that mean the assistant did not actually answer the question. */
const CHAT_FALLBACK_RE =
  /(couldn'?t\s+find|could\s+not\s+find|don'?t\s+have\s+that|no\s+(relevant\s+)?information|not\s+in\s+our|isn'?t\s+in\s+our|can'?t\s+answer|unable\s+to\s+answer|the\s+admissions\s+office\s+can\s+give|doesn'?t\s+appear\s+in\s+our)/i;
const CHAT_CAPABILITY_RE = /i\s+can\s+help\s+with\s+(programmes?\s+offered|how\s+to\s+apply)/i;

export const suggestFor = (question: string): Suggestion[] => {
  const seen = new Set<string>();
  const out: Suggestion[] = [];

  for (const group of SUGGESTION_GROUPS) {
    if (group.pattern.test(question)) {
      for (const s of group.suggestions) {
        if (!seen.has(s.query)) {
          seen.add(s.query);
          out.push(s);
        }
      }
      if (out.length >= 3) break;
    }
  }

  for (const s of DEFAULT_SUGGESTIONS) {
    if (out.length >= 3) break;
    if (!seen.has(s.query)) {
      seen.add(s.query);
      out.push(s);
    }
  }

  return out.slice(0, 3);
};

/** Returns related questions when the answer failed to address the question. */
export const shouldSuggest = (question: string, answer: string): Suggestion[] => {
  const trimmed = answer.trim();
  if (!trimmed) return suggestFor(question);
  if (trimmed.length < 25 || CHAT_FALLBACK_RE.test(trimmed) || CHAT_CAPABILITY_RE.test(trimmed)) {
    return suggestFor(question);
  }
  return [];
};