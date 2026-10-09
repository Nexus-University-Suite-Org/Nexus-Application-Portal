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
} from "lucide-react";
import gsap from "gsap";
import { apiUrl } from "@/lib/apiUrl";
import { useSiteSettings, parseJsonSetting } from "@/hooks/useSiteSettings";

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
}

const CHAT_URL = apiUrl("chat");
const STORAGE_KEY = "nap.chatbot.history.v1";

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
    return topics.map((t) => ({
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

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;
      setHasInteracted(true);

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
          setMessages((prev) =>
            prev.map((m) =>
              m.id === streamId ? { ...m, id: Date.now().toString() } : m,
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

  const resetChat = () => {
    setMessages([]);
    setHasInteracted(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const showWelcome = !hasInteracted && messages.length === 0;

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
