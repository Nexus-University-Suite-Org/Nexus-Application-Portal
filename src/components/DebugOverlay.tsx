import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Activity, AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, Copy, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  clearDebugLog,
  debugConfig,
  getDebugStats,
  getEvents,
  getNotices,
  methodColor,
  subscribeDebug,
  type NetEvent,
} from "@/lib/debugLogger";

const timeOf = (epoch: number) =>
  new Date(epoch).toLocaleTimeString("en-GB", { hour12: false }) +
  "." +
  String(new Date(epoch).getMilliseconds()).padStart(3, "0");

const statusTone = (event: NetEvent) => {
  if (event.phase === "pending") return "text-sky-300 bg-sky-500/10 border-sky-500/30";
  if (event.phase === "error" || event.ok === false)
    return "text-rose-300 bg-rose-500/10 border-rose-500/30";
  return "text-emerald-300 bg-emerald-500/10 border-emerald-500/30";
};

const CopyButton = ({ value, label }: { value: string; label: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        navigator.clipboard?.writeText(value).then(
          () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          },
          () => setCopied(false),
        );
      }}
      className="rounded p-1 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
    >
      <Copy className={cn("h-3 w-3", copied && "text-emerald-400")} />
    </button>
  );
};

const EventRow = ({ event }: { event: NetEvent }) => {
  const [open, setOpen] = useState(false);
  const Chevron = open ? ChevronDown : ChevronRight;
  const hasDetail =
    Boolean(event.responseSummary) ||
    Boolean(event.requestBody) ||
    Boolean(event.error) ||
    event.origin === "absolute";

  return (
    <div className="border-b border-border/60 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-start gap-2 px-2 py-1.5 text-left font-mono text-[11px] leading-relaxed hover:bg-white/5"
      >
        {hasDetail ? (
          <Chevron className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
        ) : (
          <span className="mt-0.5 h-3 w-3 shrink-0" />
        )}
        <span className="shrink-0 text-muted-foreground/70">{timeOf(event.startedAt)}</span>
        <span className={cn("w-10 shrink-0 font-semibold", methodColor(event.method))}>
          {event.method}
        </span>
        <span
          className={cn(
            "shrink-0 rounded border px-1.5 py-px text-[10px] font-bold",
            statusTone(event),
          )}
        >
          {event.phase === "pending"
            ? "…"
            : event.phase === "error"
              ? "ERR"
              : event.status}
        </span>
        <span className="min-w-0 flex-1 break-all text-foreground/90">{event.url}</span>
        <span className="shrink-0 text-muted-foreground">
          {event.durationMs !== undefined ? `${event.durationMs}ms` : ""}
        </span>
        {event.origin === "absolute" && (
          <span className="shrink-0 rounded bg-amber-500/15 px-1 text-[10px] text-amber-300">
            ABS
          </span>
        )}
      </button>

      {open && (
        <div className="space-y-1.5 bg-black/30 px-4 py-2 font-mono text-[10.5px] leading-relaxed text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="flex-1">
              status: {event.status ?? "-"} {event.statusText || ""} · {event.durationMs ?? "-"}ms
            </span>
            <CopyButton value={event.url} label="Copy URL" />
          </div>
          {event.requestBody && (
            <div className="flex items-start gap-1">
              <span className="shrink-0 text-sky-400">req:</span>
              <span className="min-w-0 flex-1 break-all">{event.requestBody}</span>
            </div>
          )}
          {event.responseSummary && (
            <div className="flex items-start gap-1">
              <span className="shrink-0 text-emerald-400">res:</span>
              <span className="min-w-0 flex-1 break-all">{event.responseSummary}</span>
            </div>
          )}
          {event.responseType && (
            <div>
              type: {event.responseType}
              {event.bytes !== undefined ? ` · ${event.bytes}B` : ""}
            </div>
          )}
          {event.error && (
            <div className="text-rose-300">
              {event.errorType}: {event.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DebugOverlay = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"requests" | "endpoints" | "notices">("requests");
  const [onlyProblems, setOnlyProblems] = useState(false);

  const events = useSyncExternalStore(subscribeDebug, getEvents, getEvents);
  const notices = useSyncExternalStore(subscribeDebug, getNotices, getNotices);
  const stats = useMemo(() => getDebugStats(), [events]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "d" && (event.metaKey || event.ctrlKey) && event.shiftKey) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const visibleEvents = onlyProblems
    ? events.filter((event) => event.phase === "error" || event.ok === false)
    : events;

  const badgeTone = stats.failed > 0 ? "bg-rose-500" : stats.ok > 0 ? "bg-emerald-500" : "bg-muted-foreground";

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open network debug panel"
          className="fixed bottom-4 right-4 z-[100] flex items-center gap-2 rounded-full border border-border bg-background/95 px-4 py-2 text-xs font-medium shadow-lg backdrop-blur transition-transform hover:scale-105"
        >
          <Activity className="h-4 w-4" />
          <span>Net</span>
          <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white", badgeTone)}>
            {stats.total}
          </span>
          {stats.failed > 0 && (
            <span className="text-[10px] font-semibold text-rose-500">{stats.failed} fail</span>
          )}
        </button>
      )}

      {open && (
        <div className="fixed bottom-0 right-0 z-[100] flex max-h-[85vh] w-full max-w-2xl flex-col border-l border-t border-border bg-background/95 font-mono shadow-2xl backdrop-blur sm:w-[42rem]">
          <header className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Activity className="h-4 w-4" />
            <span className="text-xs font-semibold tracking-wide">NAP network debug</span>

            <span className="ml-2 flex items-center gap-2 text-[11px]">
              <span className="text-emerald-400">{stats.ok} ok</span>
              <span className={cn(stats.failed > 0 && "text-rose-400")}>{stats.failed} failed</span>
              <span className="text-sky-400">{stats.inFlight} in flight</span>
            </span>

            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => setOnlyProblems((value) => !value)}
                className={cn(
                  "rounded border px-2 py-0.5 text-[10px] transition-colors",
                  onlyProblems
                    ? "border-rose-500/50 bg-rose-500/15 text-rose-300"
                    : "border-border text-muted-foreground hover:bg-white/5",
                )}
              >
                problems only
              </button>
              <button
                type="button"
                onClick={clearDebugLog}
                aria-label="Clear log"
                className="rounded p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close debug panel"
                className="rounded p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </header>

          <nav className="flex items-center gap-1 border-b border-border px-2 py-1 text-[11px]">
            {(["requests", "endpoints", "notices"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  "rounded px-2 py-1 capitalize transition-colors",
                  tab === key ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5",
                )}
              >
                {key}
                {key === "notices" && notices.length > 0 && (
                  <span className="ml-1 text-rose-400">{notices.length}</span>
                )}
              </button>
            ))}
            <span className="ml-auto truncate pl-3 text-[10px] text-muted-foreground/70">
              base: {debugConfig.apiBaseUrl}
            </span>
          </nav>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {tab === "requests" &&
              (visibleEvents.length === 0 ? (
                <p className="p-4 text-[11px] text-muted-foreground">
                  No requests captured yet. Navigate the site.
                </p>
              ) : (
                visibleEvents.map((event) => <EventRow key={event.id} event={event} />)
              ))}

            {tab === "endpoints" && (
              <table className="w-full text-[11px]">
                <thead className="sticky top-0 bg-background/95 text-left text-muted-foreground">
                  <tr>
                    <th className="px-2 py-1 font-normal">endpoint</th>
                    <th className="px-2 py-1 font-normal">calls</th>
                    <th className="px-2 py-1 font-normal">fail</th>
                    <th className="px-2 py-1 font-normal">avg</th>
                    <th className="px-2 py-1 font-normal">last</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.byEndpoint.map((row) => (
                    <tr key={row.key} className="border-t border-border/60">
                      <td className={cn("px-2 py-1", methodColor(row.method))}>{row.label}</td>
                      <td className="px-2 py-1">{row.count}</td>
                      <td className={cn("px-2 py-1", row.failed > 0 && "font-bold text-rose-400")}>
                        {row.failed}
                      </td>
                      <td className="px-2 py-1 text-muted-foreground">{row.avgMs}ms</td>
                      <td className="px-2 py-1">
                        {row.lastPhase === "error" ? (
                          <AlertTriangle className="h-3 w-3 text-rose-400" />
                        ) : row.lastPhase === "pending" ? (
                          <Activity className="h-3 w-3 animate-pulse text-sky-400" />
                        ) : (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            {row.lastStatus}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === "notices" &&
              (notices.length === 0 ? (
                <p className="p-4 text-[11px] text-muted-foreground">
                  No app notices, console errors, warnings, or unhandled rejections.
                </p>
              ) : (
                notices.map((notice) => (
                  <div
                    key={notice.id}
                    className="border-b border-border/60 px-2 py-1.5 text-[11px]"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle
                        className={cn(
                          "mt-0.5 h-3 w-3 shrink-0",
                          notice.kind === "info"
                            ? "text-sky-400"
                            : notice.kind === "warn"
                              ? "text-amber-400"
                              : "text-rose-400",
                        )}
                      />
                      <span className="text-muted-foreground/70">{timeOf(notice.at)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block break-all text-foreground/90">{notice.text}</span>
                        {notice.source && (
                          <span className="block break-all text-[10px] text-muted-foreground/70">
                            {notice.source}
                          </span>
                        )}
                      </span>
                      <CopyButton value={notice.stack || notice.text} label="Copy" />
                    </div>
                    {notice.stack && (
                      <pre className="mt-1 max-h-24 overflow-auto whitespace-pre-wrap break-all pl-6 text-[10px] text-muted-foreground/70">
                        {notice.stack}
                      </pre>
                    )}
                  </div>
                ))
              ))}
          </div>

          <footer className="border-t border-border px-3 py-1 text-[10px] text-muted-foreground">
            Toggle with <kbd className="rounded border border-border px-1">Ctrl+Shift+D</kbd> ·{" "}
            {stats.total} events
          </footer>
        </div>
      )}
    </>
  );
};

export default DebugOverlay;