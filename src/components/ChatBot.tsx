import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  RotateCcw,
  BookOpen,
  Calculator,
  ChevronLeft,
  Check,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import gsap from "gsap";
import { apiUrl } from "@/lib/apiUrl";
import { useSiteSettings, parseJsonSetting } from "@/hooks/useSiteSettings";
import {
  GENDER_BONUS,
  computeWeight,
  formatScore,
  isWeightQuery,
  recommendFor,
  uacePrincipalGradeOptions,
  subsidiaryGradeOptions,
  oLevelGradeOptions,
  uaceSubjectOptions,
  oLevelSubjectOptions,
  subsidiarySubjectOptions,
  type SubjectGrade,
  type WeightInput,
  type ProgramRecommendation,
} from "@/lib/weighting";
import { shouldSuggest, type Suggestion } from "@/lib/chatSuggestions";

interface Source {
  title: string;
  collection?: string;
  entity_id?: string;
}

interface QuickTopic {
  label: string;
  query: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  result?: WizardResult;
  suggestions?: Suggestion[];
}

interface WizardResult {
  summary: string;
  aLevelWeight: number;
  oLevelWeight: number;
  genderBonus: number;
  total: number;
  adjusted: number;
  primaryName: string;
  recommendations: ProgramRecommendation[];
}

type WizardStepId = "intro" | "principal" | "subsidiary" | "olevel" | "gender" | "results";

interface WizardState {
  active: boolean;
  step: WizardStepId;
  principal: SubjectGrade[];
  generalPaper: string;
  subMathSubject: string;
  subMathGrade: string;
  oLevel: SubjectGrade[];
  gender: "" | "Male" | "Female" | "Other";
  busy: boolean;
  error: string;
}

const WIZARD_STEPS: { id: WizardStepId; label: string }[] = [
  { id: "intro", label: "How it works" },
  { id: "principal", label: "A-Level subjects" },
  { id: "subsidiary", label: "General Paper" },
  { id: "olevel", label: "O-Level results" },
  { id: "gender", label: "Gender" },
  { id: "results", label: "Your matches" },
];

const EMPTY_WIZARD: WizardState = {
  active: false,
  step: "intro",
  principal: [
    { subject: "", grade: "" },
    { subject: "", grade: "" },
  ],
  generalPaper: "",
  subMathSubject: "",
  subMathGrade: "",
  oLevel: Array.from({ length: 5 }, () => ({ subject: "", grade: "" })),
  gender: "",
  busy: false,
  error: "",
};

const WEIGHT_QUICK_TOPIC: QuickTopic = {
  label: "Admission Weight",
  query: "Calculate my admission weight",
};

const CHAT_URL = apiUrl("chat");
const STORAGE_KEY = "nap.chatbot.history.v1";
const WIZARD_STORAGE_KEY = "nap.chatbot.wizard.v1";

const hasWizardData = (w: WizardState) =>
  w.principal.some((r) => r.subject || r.grade) ||
  w.oLevel.some((r) => r.subject || r.grade) ||
  Boolean(w.generalPaper || w.subMathSubject || w.subMathGrade || w.gender);

const loadWizard = (): WizardState => {
  try {
    const raw = localStorage.getItem(WIZARD_STORAGE_KEY);
    if (!raw) return EMPTY_WIZARD;
    const parsed = JSON.parse(raw) as Partial<WizardState>;
    if (!parsed || typeof parsed !== "object") return EMPTY_WIZARD;
    return {
      ...EMPTY_WIZARD,
      ...parsed,
      principal: Array.isArray(parsed.principal) ? parsed.principal : EMPTY_WIZARD.principal,
      oLevel: Array.isArray(parsed.oLevel) ? parsed.oLevel : EMPTY_WIZARD.oLevel,
      busy: false,
      error: "",
    };
  } catch {
    return EMPTY_WIZARD;
  }
};

const DEFAULT_QUICK_TOPICS: QuickTopic[] = [
  { label: "Programs", query: "What programs do you offer?" },
  { label: "Admissions", query: "How do I apply?" },
  { label: "Fees", query: "What are the tuition fees and are there scholarships?" },
  { label: "Contact", query: "How can I contact the admissions office?" },
];

const normalizeTopics = (raw: unknown): QuickTopic[] => {
  if (!Array.isArray(raw)) return DEFAULT_QUICK_TOPICS;
  const topics = raw
    .filter(
      (t): t is QuickTopic =>
        t && typeof t.label === "string" && typeof t.query === "string" && t.query.trim() !== "",
    )
    .map((t) => ({ label: t.label.trim(), query: t.query.trim() }));
  return topics.length ? topics : DEFAULT_QUICK_TOPICS;
};

async function streamChat({
  messages,
  onDelta,
  onSources,
  onDone,
  onError,
}: {
  messages: { role: string; content: string }[];
  onDelta: (text: string) => void;
  onSources: (sources: Source[]) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  try {
    if (!CHAT_URL) {
      onError("Chat is temporarily unavailable.");
      return;
    }

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      onError(data.error || "Something went wrong. Please try again.");
      return;
    }

    if (!resp.body) {
      onError("No response stream available.");
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          onDone();
          return;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
          if (Array.isArray(parsed.sources)) onSources(parsed.sources);
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }

    if (buffer.trim()) {
      for (let raw of buffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
          if (Array.isArray(parsed.sources)) onSources(parsed.sources);
        } catch {
          /* ignore */
        }
      }
    }

    onDone();
  } catch {
    onError("Failed to connect. Please try again.");
  }
}

// Markdown rendering without a parser dependency, so nothing is ever injected as
// HTML: every branch returns React elements and plain text spans.
const INLINE_SPLIT_RE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/;
const LINK_RE = /^\[([^\]]+)\]\(([^)\s]+)\)$/;
const EMPHASIS_SPLIT_RE = /(\*[^*\n]+\*|_[^_\n]+_)/;
const UNORDERED_RE = /^[-*•]\s+(.*)$/;
const ORDERED_RE = /^\d+[.)]\s+(.*)$/;
const HEADING_RE = /^(#{1,4})\s+(.*)$/;

const renderInline = (str: string, keyBase: string): React.ReactNode[] => {
  const out: React.ReactNode[] = [];

  str.split(INLINE_SPLIT_RE).forEach((part, i) => {
    if (!part) return;
    const key = `${keyBase}-${i}`;

    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      out.push(
        <strong key={key} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>,
      );
      return;
    }

    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      out.push(
        <code
          key={key}
          className="text-[11px] bg-muted px-1 py-0.5 rounded font-mono break-all"
        >
          {part.slice(1, -1)}
        </code>,
      );
      return;
    }

    const link = LINK_RE.exec(part);
    if (link) {
      const [, label, href] = link;
      const external = /^https?:/i.test(href);
      out.push(
        <a
          key={key}
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="text-accent underline underline-offset-2 hover:opacity-80 break-all"
        >
          {label}
        </a>,
      );
      return;
    }

    // Emphasis is resolved last so it cannot chew into **bold** spans, which
    // are already broken out above.
    part.split(EMPHASIS_SPLIT_RE).forEach((fragment, j) => {
      if (!fragment) return;
      const fragmentKey = `${key}-${j}`;
      const emphasised =
        (fragment.startsWith("*") && fragment.endsWith("*")) ||
        (fragment.startsWith("_") && fragment.endsWith("_"));
      if (emphasised && fragment.length > 2) {
        out.push(
          <em key={fragmentKey} className="italic">
            {fragment.slice(1, -1)}
          </em>,
        );
        return;
      }
      out.push(<span key={fragmentKey}>{fragment}</span>);
    });
  });

  return out;
};

const renderMarkdown = (text: string) => {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushList = () => {
    if (!list) return;
    const items = list.items;
    const Tag = list.ordered ? "ol" : "ul";
    blocks.push(
      <Tag
        key={`list-${blocks.length}`}
        className={`my-1 space-y-1 ${list.ordered ? "ml-4 list-decimal" : "ml-1"}`}
      >
        {items.map((item, idx) => (
          <li key={idx} className="flex gap-2 items-start break-words">
            {list!.ordered ? (
              <span className="text-accent font-semibold text-[11px] leading-[1.45] shrink-0">
                {idx + 1}.
              </span>
            ) : (
              <span className="text-accent text-[6px] leading-[1.7] shrink-0">●</span>
            )}
            <span className="min-w-0">{renderInline(item, `li-${blocks.length}-${idx}`)}</span>
          </li>
        ))}
      </Tag>,
    );
    list = null;
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    const unordered = UNORDERED_RE.exec(trimmed);
    const ordered = ORDERED_RE.exec(trimmed);
    if (unordered || ordered) {
      const isOrdered = Boolean(ordered);
      if (!list || list.ordered !== isOrdered) {
        flushList();
        list = { ordered: isOrdered, items: [] };
      }
      list.items.push((unordered ? unordered[1] : ordered![1]).trim());
      return;
    }

    flushList();

    if (trimmed === "") {
      blocks.push(<div key={`br-${i}`} className="h-1.5" />);
      return;
    }

    const heading = HEADING_RE.exec(trimmed);
    if (heading) {
      const level = heading[1].length;
      blocks.push(
        <p
          key={`h-${i}`}
          className={`font-semibold text-foreground mt-1 first:mt-0 ${
            level <= 2 ? "text-[13px]" : "text-[12px]"
          }`}
        >
          {renderInline(heading[2], `h-${i}`)}
        </p>,
      );
      return;
    }

    blocks.push(
      <p key={`p-${i}`} className="my-0 break-words">
        {renderInline(trimmed, `p-${i}`)}
      </p>,
    );
  });

  flushList();

  return blocks;
};

const WzSelect = ({
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  ariaLabel: string;
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    aria-label={ariaLabel}
    className="flex-1 min-w-0 bg-background border border-border rounded-lg px-2 py-1.5 text-[12px] text-card-foreground focus:outline-none focus:border-accent/50"
  >
    <option value="">{placeholder}</option>
    {options.map((o) => (
      <option key={o} value={o}>
        {o}
      </option>
    ))}
  </select>
);

const SubjectGradeRow = ({
  row,
  index,
  subjectOptions,
  gradeOptions,
  subjectPlaceholder,
  gradePlaceholder,
  onUpdate,
  onRemove,
  canRemove,
}: {
  row: SubjectGrade;
  index: number;
  subjectOptions: string[];
  gradeOptions: string[];
  subjectPlaceholder: string;
  gradePlaceholder: string;
  onUpdate: (index: number, patch: Partial<SubjectGrade>) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}) => (
  <div className="flex items-center gap-1.5">
    <WzSelect
      value={row.subject}
      onChange={(v) => onUpdate(index, { subject: v })}
      options={subjectOptions}
      placeholder={subjectPlaceholder}
      ariaLabel={`Subject ${index + 1}`}
    />
    <WzSelect
      value={row.grade}
      onChange={(v) => onUpdate(index, { grade: v })}
      options={gradeOptions}
      placeholder={gradePlaceholder}
      ariaLabel={`Grade ${index + 1}`}
    />
    {canRemove && (
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
        title="Remove row"
      >
        <Trash2 size={13} />
      </button>
    )}
  </div>
);

const BAND_STYLES: Record<ProgramRecommendation["band"], { label: string; badge: string }> = {
  Qualified: { label: "Qualified", badge: "bg-green-500/15 text-green-600 border-green-500/25" },
  Close: { label: "Close", badge: "bg-amber-500/15 text-amber-600 border-amber-500/25" },
  Reach: { label: "Reach", badge: "bg-muted text-muted-foreground border-border" },
};

const ResultCard = ({ result, onRerun }: { result: WizardResult; onRerun?: () => void }) => {
  const subjectsLine = (text: string | undefined) =>
    text ? text.replace(/\s+/g, " ").trim() : "—";

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-background/60 p-3 space-y-1.5">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Your admission weight
        </p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
          <span className="text-muted-foreground" title={result.primaryName}>
            A-Level (for best match)
          </span>
          <span className="text-right font-medium">{formatScore(result.aLevelWeight)}</span>
          <span className="text-muted-foreground">O-Level (best 8)</span>
          <span className="text-right font-medium">{formatScore(result.oLevelWeight)}</span>
          <span className="text-muted-foreground">
            Female bonus{result.genderBonus ? ` (+${formatScore(result.genderBonus)})` : ""}
          </span>
          <span className="text-right font-medium">{formatScore(result.genderBonus)}</span>
          <span className="text-foreground font-semibold border-t border-border pt-1">Total</span>
          <span className="text-right font-bold text-accent text-[13px] border-t border-border pt-1">
            {formatScore(result.adjusted)}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground pt-0.5">
          Shown for <span className="text-foreground/70">{result.primaryName}</span>; other
          programmes may score differently.
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-3 flex-wrap text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Meets cut-off
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Close (within 1.5)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/40" /> Reach
          </span>
        </div>
      </div>

      {result.recommendations.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">
          I couldn&rsquo;t load the programme list. Please try again.
        </p>
      ) : (
        <ul className="space-y-2">
          {result.recommendations.map((r) => (
            <li key={r.program.programCode} className="rounded-xl border border-border p-3 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-card-foreground leading-snug">
                    {r.program.programName}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {r.program.programCode} · {r.program.facultySchool || "Faculty"}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${BAND_STYLES[r.band].badge}`}
                >
                  {BAND_STYLES[r.band].label}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div>
                  <p className="text-muted-foreground">Your weight</p>
                  <p className="font-semibold">{formatScore(r.adjusted)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cut-off</p>
                  <p className="font-semibold">{formatScore(r.program.cutoffScore)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Slack</p>
                  <p className={`font-semibold ${r.margin >= 0 ? "text-green-600" : "text-muted-foreground"}`}>
                    {r.margin >= 0 ? "+" : ""}{formatScore(r.margin)}
                  </p>
                </div>
              </div>
              {!r.meetsUcePasses && (
                <p className="text-[11px] text-amber-600 flex items-start gap-1.5">
                  <AlertCircle size={12} className="shrink-0 mt-0.5" />
                  You have {r.oLevelPasses} O-Level passes but this programme requires{" "}
                  {r.program.minimumUcePasses}.
                </p>
              )}
              <div className="text-[11px] text-muted-foreground space-y-0.5">
                <p><span className="text-foreground/70">Essential:</span> {subjectsLine(r.program.essentialSubjects)}</p>
                <p><span className="text-foreground/70">Relevant:</span> {subjectsLine(r.program.relevantSubjects)}</p>
                <p><span className="text-foreground/70">Desirable:</span> {subjectsLine(r.program.desirableSubjects)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {onRerun && (
        <button
          type="button"
          onClick={onRerun}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-accent/40 text-accent text-[12px] font-medium hover:bg-accent/10 transition-colors"
        >
          <RotateCcw size={13} /> Re-run with different grades
        </button>
      )}
    </div>
  );
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (m) =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.id !== "streaming",
      ) as Message[];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [wizard, setWizard] = useState<WizardState>(loadWizard);
  const chatRef = useRef<HTMLDivElement>(null);

  const { settings } = useSiteSettings({
    keys: [
      "portal_name",
      "chat_enabled",
      "chat_display_name",
      "chat_persona_name",
      "chat_welcome_message",
      "chat_quick_topics",
      "chat_show_sources",
    ],
    scope: "ChatBot",
  });

  const chatEnabled = (settings.chat_enabled ?? "true").trim().toLowerCase() !== "false";
  const portalName = settings.portal_name?.trim() || "University";
  const assistantName = settings.chat_display_name?.trim() || "Assistant";
  const personaName = settings.chat_persona_name?.trim() || "";
  const showSources = (settings.chat_show_sources ?? "true").trim().toLowerCase() !== "false";

  const quickTopics = useMemo(() => {
    const topics = normalizeTopics(
      parseJsonSetting<QuickTopic[]>(settings.chat_quick_topics, DEFAULT_QUICK_TOPICS),
    );
    const withWeight = [WEIGHT_QUICK_TOPIC, ...topics.filter((t) => t.query !== WEIGHT_QUICK_TOPIC.query)];
    return withWeight.map((t) => ({
      ...t,
      query: t.query.replace(/\{university\}/g, portalName),
    }));
  }, [settings.chat_quick_topics, portalName]);

  const welcomeHeading = personaName ? `Hi, I'm ${personaName}! 👋` : "Hi there! 👋";
  const welcomeBody = (
    settings.chat_welcome_message?.trim() ||
    `Your guide to everything ${portalName}. What would you like to know?`
  )
    .replace(/\{university\}/g, portalName)
    .replace(/\{name\}/g, personaName);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Persist completed history. Skip while a message is still streaming so we
  // never store a partial answer.
  useEffect(() => {
    if (messages.some((m) => m.id === "streaming")) return;
    try {
      if (messages.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      }
    } catch {
      /* storage unavailable / quota */
    }
  }, [messages]);

  // Persist the in-progress calculator so a refresh (or re-opening the chat)
  // resumes where the student left off. Transient flags are never stored.
  useEffect(() => {
    try {
      if (!wizard.active && !hasWizardData(wizard)) {
        localStorage.removeItem(WIZARD_STORAGE_KEY);
      } else {
        localStorage.setItem(
          WIZARD_STORAGE_KEY,
          JSON.stringify({ ...wizard, busy: false, error: "" }),
        );
      }
    } catch {
      /* storage unavailable / quota */
    }
  }, [wizard]);

  useEffect(() => {
    if (chatRef.current && isOpen) {
      const tl = gsap.timeline();
      tl.fromTo(
        chatRef.current,
        { opacity: 0, y: 30, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power4.out" },
      );
      // Focus input after open
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [isOpen]);

  // Animate new messages
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.id !== "streaming") {
      const el = messageRefs.current.get(lastMsg.id);
      if (el) {
        gsap.fromTo(
          el,
          { opacity: 0, y: 12, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power3.out" },
        );
      }
    }
  }, [messages.length]);

  // Pulse animation on FAB
  useEffect(() => {
    if (!isOpen && buttonRef.current) {
      const pulse = gsap.to(buttonRef.current, {
        boxShadow: "0 0 0 8px hsla(38, 52%, 45%, 0.15)",
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      return () => {
        pulse.kill();
      };
    }
  }, [isOpen]);

  const updatePrincipal = (index: number, patch: Partial<SubjectGrade>) =>
    setWizard((w) => ({
      ...w,
      principal: w.principal.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    }));

  const updateOLevel = (index: number, patch: Partial<SubjectGrade>) =>
    setWizard((w) => ({
      ...w,
      oLevel: w.oLevel.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    }));

  const addPrincipal = () =>
    setWizard((w) => ({ ...w, principal: [...w.principal, { subject: "", grade: "" }] }));

  const addOLevel = () =>
    setWizard((w) => ({ ...w, oLevel: [...w.oLevel, { subject: "", grade: "" }] }));

  const removePrincipal = (index: number) =>
    setWizard((w) => ({ ...w, principal: w.principal.filter((_, i) => i !== index) }));

  const removeOLevel = (index: number) =>
    setWizard((w) => ({ ...w, oLevel: w.oLevel.filter((_, i) => i !== index) }));

  const goBack = () =>
    setWizard((w) => {
      const order: WizardStepId[] = ["intro", "principal", "subsidiary", "olevel", "gender", "results"];
      const idx = order.indexOf(w.step);
      return { ...w, step: order[Math.max(0, idx - 1)], error: "" };
    });

  const goNext = () =>
    setWizard((w) => {
      if (w.step === "principal") {
        if (w.principal.filter((r) => r.subject && r.grade).length < 2)
          return { ...w, error: "Please enter at least two A-Level principal subjects with grades." };
        return { ...w, step: "subsidiary", error: "" };
      }
      if (w.step === "subsidiary") return { ...w, step: "olevel", error: "" };
      if (w.step === "olevel") {
        if (w.oLevel.filter((r) => r.subject && r.grade).length < 5)
          return { ...w, error: "Please enter at least five O-Level subjects with grades." };
        return { ...w, step: "gender", error: "" };
      }
      if (w.step === "intro") return { ...w, step: "principal", error: "" };
      return w;
    });

  const finishWizard = async () => {
    if (!wizard.gender) {
      setWizard((w) => ({ ...w, error: "Please select your gender to apply the correct bonus." }));
      return;
    }

    const principal = wizard.principal.filter((r) => r.subject && r.grade);
    const oLevel = wizard.oLevel.filter((r) => r.subject && r.grade);
    const input: WeightInput = {
      principal,
      subsidiaries: [
        ...(wizard.generalPaper
          ? [{ subject: "General Paper", grade: wizard.generalPaper }]
          : []),
        ...(wizard.subMathSubject && wizard.subMathGrade
          ? [{ subject: wizard.subMathSubject, grade: wizard.subMathGrade }]
          : []),
      ],
      oLevel,
      gender: wizard.gender,
    };

    const gradeSummary = [
      `A-Level: ${principal.map((s) => `${s.subject} ${s.grade}`).join(", ")}`,
      input.subsidiaries.length
        ? `Subsidiary: ${input.subsidiaries.map((s) => `${s.subject} ${s.grade}`).join(", ")}`
        : null,
      `O-Level: ${oLevel.map((s) => `${s.subject} ${s.grade}`).join(", ")}`,
      `Gender: ${wizard.gender}`,
    ]
      .filter(Boolean)
      .join("\n");

    setWizard((w) => ({ ...w, busy: true, error: "" }));

    try {
      const recommendations = await recommendFor(input);
      const top = recommendations.slice(0, 8);
      const best = recommendations[0];

      const result: WizardResult = {
        summary: gradeSummary,
        aLevelWeight: best?.aLevelWeight ?? 0,
        oLevelWeight: best?.oLevelWeight ?? 0,
        genderBonus: best?.genderBonus ?? 0,
        total: best?.total ?? 0,
        adjusted: best?.adjusted ?? 0,
        primaryName: best?.program.programName ?? "your best match",
        recommendations: top,
      };

      const intro =
        top.length > 0
          ? "Here's what I calculated from your grades. A-Level weighting depends on each programme's Essential, Relevant and Desirable subjects, so the score changes per programme — I've compared you against every active NAD programme below."
          : "I couldn't load the current programme list right now. Please try again in a moment.";

      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-u`, role: "user", content: `Here are my grades:\n${gradeSummary}` },
        { id: `${Date.now()}-a`, role: "assistant", content: intro, result },
      ]);
      setWizard(EMPTY_WIZARD);
      setHasInteracted(true);
    } catch {
      setWizard((w) => ({
        ...w,
        busy: false,
        error: "Couldn't reach the admissions dashboard. Check your connection and try again.",
      }));
    }
  };

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;
      setHasInteracted(true);

      if (isWeightQuery(text)) {
        const userMsg: Message = {
          id: Date.now().toString(),
          role: "user",
          content: text.trim(),
        };
        const introMsg: Message = {
          id: `${Date.now()}-intro`,
          role: "assistant",
          content:
            "Great — let's work out your admission weight and find your best-fit programmes. I'll use the standard Uganda public-university formula:\n\n**A-Level** → grade points (A=6 … E=2) × subject weight (Essential ×3, Relevant ×2, Desirable ×1, Other ×0.5)\n**O-Level** → your best 8 subjects (D1/D2=0.3, Credit 3-6=0.2, Pass 7-8=0.1)\n**Female applicants** → +1.5 bonus\n\nFollow the steps in the panel below. You can go back at any time.",
        };
        setMessages((prev) => [...prev, userMsg, introMsg]);
        setWizard((w) =>
          hasWizardData(w) && w.step !== "results"
            ? { ...w, active: true, busy: false, error: "" }
            : { ...EMPTY_WIZARD, active: true, step: "intro" },
        );
        setInput("");
        return;
      }

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text.trim(),
      };

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInput("");
      setIsLoading(true);

      let assistantSoFar = "";
      let assistantSources: Source[] = [];
      const streamId = "streaming";

      const upsertAssistant = (chunk: string) => {
        assistantSoFar += chunk;
        const snapshot = assistantSoFar;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.id === streamId) {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: snapshot } : m,
            );
          }
          return [
            ...prev,
            {
              id: streamId,
              role: "assistant" as const,
              content: snapshot,
              sources: assistantSources.length ? assistantSources : undefined,
            },
          ];
        });
      };

      const attachSources = (sources: Source[]) => {
        if (!Array.isArray(sources) || sources.length === 0) return;
        assistantSources = sources;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.id !== streamId) return prev;
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, sources } : m,
          );
        });
      };

      await streamChat({
        messages: updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        onDelta: upsertAssistant,
        onSources: attachSources,
        onDone: () => {
          const suggestions = shouldSuggest(text, assistantSoFar);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === streamId
                ? {
                    ...m,
                    id: Date.now().toString(),
                    suggestions: suggestions.length ? suggestions : undefined,
                  }
                : m,
            ),
          );
          setIsLoading(false);
        },
        onError: (err) => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "assistant" as const,
              content: `Sorry, something went wrong: ${err}`,
            },
          ]);
          setIsLoading(false);
        },
      });
    },
    [messages, isLoading],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const reRunWizard = () => setWizard({ ...EMPTY_WIZARD, active: true, step: "intro" });

  const handleSuggestion = (msgId: string, query: string) => {
    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, suggestions: undefined } : m)));
    sendMessage(query);
    setHasInteracted(true);
  };

  const resetChat = () => {
    setMessages([]);
    setHasInteracted(false);
    setWizard(EMPTY_WIZARD);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(WIZARD_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const showWelcome = !hasInteracted && messages.length === 0;
  const wizardStepIndex = Math.max(
    0,
    WIZARD_STEPS.findIndex((s) => s.id === wizard.step),
  );

  if (!chatEnabled) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {isOpen && (
        <div
          ref={chatRef}
          className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] sm:w-[400px] h-[min(580px,calc(100vh-6rem))] rounded-3xl border border-border/40 bg-card text-card-foreground shadow-[0_25px_80px_-12px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="relative flex items-center justify-between px-5 py-4 bg-gradient-to-r from-accent to-accent/85">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent_60%)]" />
            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent-foreground/15 backdrop-blur-sm flex items-center justify-center border border-accent-foreground/10">
                <Sparkles size={18} className="text-accent-foreground" />
              </div>
              <div>
                <p className="font-heading text-base font-semibold tracking-wide text-accent-foreground">
                  {portalName}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] text-accent-foreground/70 tracking-wider uppercase">
                    {assistantName}
                  </span>
                </div>
              </div>
            </div>
            <div className="relative flex items-center gap-1">
              {hasInteracted && (
                <button
                  onClick={resetChat}
                  className="p-2 rounded-xl hover:bg-accent-foreground/10 transition-colors"
                  title="New conversation"
                >
                  <RotateCcw size={15} className="text-accent-foreground/80" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl hover:bg-accent-foreground/10 transition-colors"
              >
                <X size={16} className="text-accent-foreground/80" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
            {/* Welcome State */}
            {showWelcome && (
              <div className="flex flex-col items-center text-center pt-6 pb-4 px-2">
                <div className="w-16 h-16 rounded-3xl bg-accent/10 flex items-center justify-center mb-4 border border-accent/20">
                  <Sparkles size={28} className="text-accent" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-card-foreground mb-1.5">
                  {welcomeHeading}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-[260px]">
                  {welcomeBody}
                </p>
                <div className="grid grid-cols-2 gap-2 w-full">
                  {quickTopics.map((topic) => (
                    <button
                      key={topic.label}
                      onClick={() => sendMessage(topic.query)}
                      className="group relative px-3 py-2.5 rounded-2xl border border-border bg-muted/50 hover:bg-accent/5 hover:border-accent/30 transition-all duration-300 text-left"
                    >
                      <span className="text-xs font-medium text-card-foreground group-hover:text-accent transition-colors duration-300">
                        {topic.label}
                      </span>
                      <span className="block text-[10px] text-muted-foreground mt-0.5 leading-tight">
                        {topic.query.length > 30
                          ? topic.query.slice(0, 30) + "…"
                          : topic.query}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message Bubbles */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                ref={(el) => {
                  if (el) messageRefs.current.set(msg.id, el);
                }}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 mt-1 border border-accent/15">
                    <Bot size={13} className="text-accent" />
                  </div>
                )}
                <div
                  className={`min-w-0 max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed break-words overflow-wrap-anywhere ${
                    msg.role === "user"
                      ? "bg-accent text-accent-foreground rounded-br-lg"
                      : "bg-muted text-card-foreground rounded-bl-lg border border-border"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="space-y-0.5">
                      {renderMarkdown(msg.content)}
                      {msg.result && (
                        <div className="mt-2 pt-2 border-t border-border/60">
                          <ResultCard result={msg.result} onRerun={reRunWizard} />
                        </div>
                      )}
                      {showSources && msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/60">
                          <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                            <BookOpen size={11} />
                            Sources
                          </p>
                          <ul className="space-y-0.5">
                            {msg.sources.map((s, i) => (
                              <li
                                key={`${s.title}-${i}`}
                                className="text-[11px] text-muted-foreground truncate"
                                title={s.title}
                              >
                                {s.title}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/60">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                            Related questions
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.suggestions.map((s) => (
                              <button
                                key={s.query}
                                type="button"
                                onClick={() => handleSuggestion(msg.id, s.query)}
                                className="text-[11px] px-2.5 py-1 rounded-full border border-accent/40 text-accent hover:bg-accent/10 transition-colors"
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-xl bg-muted/60 flex items-center justify-center flex-shrink-0 mt-1 border border-border/30">
                    <User size={13} className="text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading &&
              messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 border border-accent/15">
                    <Bot size={13} className="text-accent" />
                  </div>
                  <div className="bg-secondary/60 rounded-2xl rounded-bl-lg px-4 py-3.5 flex gap-1.5 border border-border/30">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-accent/50 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            {/* Admission Weight wizard */}
            {wizard.active && (
              <div className="rounded-2xl border border-accent/30 bg-card p-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
                    <Calculator size={13} /> Admission Weight
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      {WIZARD_STEPS[wizardStepIndex]?.label}
                    </span>
                    {wizard.step !== "intro" && (
                      <button
                        type="button"
                        onClick={reRunWizard}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Re-run calculator"
                      >
                        <RotateCcw size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setWizard(EMPTY_WIZARD)}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="Close calculator"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>

                {/* progress dots */}
                <div className="flex gap-1.5">
                  {WIZARD_STEPS.slice(0, 5).map((s, i) => (
                    <span
                      key={s.id}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= wizardStepIndex ? "bg-accent" : "bg-border"
                      }`}
                    />
                  ))}
                </div>

                {wizard.step === "intro" && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      I&rsquo;ll ask for your A-Level principal subjects, General Paper / subsidiary
                      grade, best O-Level subjects and gender, then rank every current NAD
                      programme against its cut-off.
                    </p>
                    <button
                      type="button"
                      onClick={goNext}
                      className="w-full py-2 rounded-xl bg-accent text-accent-foreground text-[12px] font-medium hover:bg-accent/85 transition-colors"
                    >
                      Let&rsquo;s start
                    </button>
                  </div>
                )}

                {wizard.step === "principal" && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground">
                      Add your A-Level principal subjects and grades (at least two).
                    </p>
                    <div className="space-y-1.5">
                      {wizard.principal.map((row, i) => (
                        <SubjectGradeRow
                          key={i}
                          row={row}
                          index={i}
                          subjectOptions={uaceSubjectOptions}
                          gradeOptions={uacePrincipalGradeOptions}
                          subjectPlaceholder="Subject"
                          gradePlaceholder="Grade"
                          onUpdate={updatePrincipal}
                          onRemove={removePrincipal}
                          canRemove={wizard.principal.length > 1}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addPrincipal}
                      className="flex items-center gap-1 text-[11px] text-accent hover:underline"
                    >
                      <Plus size={12} /> Add another subject
                    </button>
                  </div>
                )}

                {wizard.step === "subsidiary" && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground">
                      Add General Paper and/or a subsidiary subject (optional).
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-24 shrink-0 text-[11px] text-muted-foreground">
                        General Paper
                      </span>
                      <WzSelect
                        value={wizard.generalPaper}
                        onChange={(v) => setWizard((w) => ({ ...w, generalPaper: v }))}
                        options={subsidiaryGradeOptions}
                        placeholder="Grade"
                        ariaLabel="General Paper grade"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-24 shrink-0 text-[11px] text-muted-foreground">
                        Subsidiary
                      </span>
                      <WzSelect
                        value={wizard.subMathSubject}
                        onChange={(v) => setWizard((w) => ({ ...w, subMathSubject: v }))}
                        options={subsidiarySubjectOptions.filter((s) => s !== "General Paper")}
                        placeholder="Subject"
                        ariaLabel="Subsidiary subject"
                      />
                      <WzSelect
                        value={wizard.subMathGrade}
                        onChange={(v) => setWizard((w) => ({ ...w, subMathGrade: v }))}
                        options={subsidiaryGradeOptions}
                        placeholder="Grade"
                        ariaLabel="Subsidiary grade"
                      />
                    </div>
                  </div>
                )}

                {wizard.step === "olevel" && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground">
                      Add your O-Level subjects and grades (at least five; your best 8 are used).
                    </p>
                    <div className="space-y-1.5">
                      {wizard.oLevel.map((row, i) => (
                        <SubjectGradeRow
                          key={i}
                          row={row}
                          index={i}
                          subjectOptions={oLevelSubjectOptions}
                          gradeOptions={oLevelGradeOptions}
                          subjectPlaceholder="Subject"
                          gradePlaceholder="Grade"
                          onUpdate={updateOLevel}
                          onRemove={removeOLevel}
                          canRemove={wizard.oLevel.length > 1}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addOLevel}
                      className="flex items-center gap-1 text-[11px] text-accent hover:underline"
                    >
                      <Plus size={12} /> Add another subject
                    </button>
                  </div>
                )}

                {wizard.step === "gender" && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground">
                      Select your gender. Female applicants receive the +{formatScore(GENDER_BONUS)}{" "}
                      affirmative-action bonus.
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["Female", "Male", "Other"] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setWizard((w) => ({ ...w, gender: g, error: "" }))}
                          className={`py-2 rounded-xl text-[12px] font-medium border transition-colors ${
                            wizard.gender === g
                              ? "bg-accent text-accent-foreground border-accent"
                              : "bg-background text-card-foreground border-border hover:border-accent/40"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {wizard.error && (
                  <p className="text-[11px] text-destructive flex items-start gap-1.5">
                    <AlertCircle size={12} className="shrink-0 mt-0.5" />
                    {wizard.error}
                  </p>
                )}

                {wizard.step !== "intro" && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={goBack}
                      disabled={wizard.busy}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl border border-border text-[12px] text-card-foreground hover:bg-muted transition-colors disabled:opacity-40"
                    >
                      <ChevronLeft size={13} /> Back
                    </button>
                    {wizard.step === "gender" ? (
                      <button
                        type="button"
                        onClick={finishWizard}
                        disabled={wizard.busy}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-accent text-accent-foreground text-[12px] font-medium hover:bg-accent/85 transition-colors disabled:opacity-60"
                      >
                        {wizard.busy ? (
                          <>
                            <Loader2 size={13} className="animate-spin" /> Calculating…
                          </>
                        ) : (
                          <>
                            <Check size={13} /> See my matches
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={goNext}
                        disabled={wizard.busy}
                        className="flex-1 py-2 rounded-xl bg-accent text-accent-foreground text-[12px] font-medium hover:bg-accent/85 transition-colors disabled:opacity-60"
                      >
                        Next
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-4 py-3 border-t border-border bg-card">
            <div className="flex items-center gap-2 bg-background border border-border rounded-2xl px-4 py-1 focus-within:border-accent/40 focus-within:shadow-[0_0_0_3px_hsla(38,52%,45%,0.08)] transition-all duration-300">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 bg-transparent py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="w-8 h-8 rounded-xl bg-accent text-accent-foreground flex items-center justify-center hover:bg-accent/85 transition-all duration-200 disabled:opacity-30 disabled:hover:bg-accent shrink-0"
              >
                <Send size={14} />
              </button>
            </div>
            <p className="text-[9px] text-muted-foreground text-center mt-2 tracking-wide">
              Powered by {portalName} AI · Responses may be approximate
            </p>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-2xl bg-accent text-accent-foreground shadow-[0_8px_30px_-4px_hsla(38,52%,45%,0.4)] hover:shadow-[0_12px_40px_-4px_hsla(38,52%,45%,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center"
      >
        <div className="relative">
          {isOpen ? (
            <X size={22} />
          ) : (
            <>
              <MessageCircle size={22} />
              {!hasInteracted && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-accent animate-pulse" />
              )}
            </>
          )}
        </div>
      </button>
    </div>
  );
};

export default ChatBot;
