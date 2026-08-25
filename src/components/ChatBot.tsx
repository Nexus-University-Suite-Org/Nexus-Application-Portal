import { useState, useRef, useEffect, useCallback, FormEvent } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import gsap from "gsap";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// Chat backend was removed with the legacy stack.
// Point this at the future Spring Boot chat endpoint when available.
const CHAT_URL = "";

const getQuickTopics = (instituteName: string) => [
  { label: "Admissions", query: `How do I apply to ${instituteName}?` },
  { label: "Programs", query: "What programs do you offer?" },
  { label: "Campus Life", query: "Tell me about student life on campus" },
  { label: "Tuition", query: "What are the tuition costs?" },
];

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: { role: string; content: string }[];
  onDelta: (text: string) => void;
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

// Enhanced markdown rendering with lists and inline code
const renderMarkdown = (text: string) => {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="ml-4 space-y-0.5 my-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex gap-1.5 items-start">
              <span className="text-accent mt-1 text-[8px]">●</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>,
      );
      listItems = [];
    }
  };

  const renderInline = (str: string): React.ReactNode[] => {
    return str.split(/(\*\*.*?\*\*|`.*?`)/).map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={j} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={j}
            className="text-[11px] bg-muted px-1 py-0.5 rounded font-mono"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      listItems.push(trimmed.slice(2));
    } else {
      flushList();
      if (trimmed === "") {
        elements.push(<div key={`br-${i}`} className="h-1.5" />);
      } else {
        elements.push(
          <p key={`p-${i}`} className="my-0">
            {renderInline(trimmed)}
          </p>,
        );
      }
    }
  });
  flushList();

  return elements;
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [portalName] = useState("University Application Portal");
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
            { id: streamId, role: "assistant" as const, content: snapshot },
          ];
        });
      };

      await streamChat({
        messages: updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        onDelta: upsertAssistant,
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
  };

  const showWelcome = !hasInteracted && messages.length === 0;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {isOpen && (
        <div
          ref={chatRef}
          className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] sm:w-[400px] h-[min(580px,calc(100vh-6rem))] rounded-3xl border border-border/40 bg-white shadow-[0_25px_80px_-12px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden"
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
                    AI Assistant
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
                <h3 className="font-heading text-xl font-semibold text-gray-900 mb-1.5">
                  Hi, I'm Vera! 👋
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-5 max-w-[260px]">
                  Your AI guide to everything {portalName}. What would you like
                  to know?
                </p>
                <div className="grid grid-cols-2 gap-2 w-full">
                  {getQuickTopics(portalName).map((topic) => (
                    <button
                      key={topic.label}
                      onClick={() => sendMessage(topic.query)}
                      className="group relative px-3 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-accent/5 hover:border-accent/30 transition-all duration-300 text-left"
                    >
                      <span className="text-xs font-medium text-gray-800 group-hover:text-accent transition-colors duration-300">
                        {topic.label}
                      </span>
                      <span className="block text-[10px] text-gray-400 mt-0.5 leading-tight">
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
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-accent text-white rounded-br-lg"
                      : "bg-gray-100 text-gray-800 rounded-bl-lg border border-gray-200"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="space-y-0.5">
                      {renderMarkdown(msg.content)}
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
                  <div className="bg-secondary/60 rounded-2xl rounded-bl-lg px-4 py-3.5 flex gap-1 border border-border/30">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-accent/50"
                        style={{
                          animation: "bounce 1.2s infinite",
                          animationDelay: `${i * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-4 py-3 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-1 focus-within:border-accent/40 focus-within:shadow-[0_0_0_3px_hsla(38,52%,45%,0.08)] transition-all duration-300">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 bg-transparent py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
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
            <p className="text-[9px] text-gray-400 text-center mt-2 tracking-wide">
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
