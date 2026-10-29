import { apiBaseUrl } from "@/lib/apiUrl";

export type NetPhase = "pending" | "done" | "error" | "cancelled";

export type NetEvent = {
  id: number;
  startedAt: number;
  finishedAt?: number;
  durationMs?: number;
  method: string;
  url: string;
  label: string;
  origin: "relative" | "absolute" | "other";
  phase: NetPhase;
  status?: number;
  statusText?: string;
  ok?: boolean;
  requestBody?: string;
  responseSummary?: string;
  responseType?: string;
  errorType?: string;
  error?: string;
  bytes?: number;
  failedByCaller?: boolean;
};

export type DebugStat = {
  total: number;
  ok: number;
  failed: number;
  pending: number;
  inFlight: number;
  byEndpoint: Array<{
    key: string;
    method: string;
    label: string;
    count: number;
    failed: number;
    avgMs: number;
    lastStatus?: number;
    lastPhase: NetPhase;
  }>;
};

export type DebugNotice = {
  id: number;
  at: number;
  kind: "info" | "error" | "rejection" | "warn";
  text: string;
  stack?: string;
  source?: string;
};

const MAX_EVENTS = 300;
const MAX_NOTICES = 60;
const MAX_BODY_CHARS = 1200;

let events: NetEvent[] = [];
let notices: DebugNotice[] = [];
let seq = 0;
let installed = false;
let originalFetch: typeof fetch | null = null;
let originalConsoleError: typeof console.error | null = null;

const listeners = new Set<() => void>();

const notify = () => {
  for (const listener of listeners) listener();
};

export const subscribeDebug = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getEvents = () => events;
export const getNotices = () => notices;

/**
 * Manual breadcrumb. Routes to console with the [NAP] tag and is mirrored into
 * the overlay's notices tab, so app-level messages that are otherwise swallowed
 * (e.g. `.catch(() => {})`) stay visible.
 */
export const logDebug = (level: "info" | "warn" | "error", message: string) => {
  const prefix = "%c[NAP]%c";
  const tagStyle = "background:#4338ca;color:#eef2ff;padding:2px 6px;border-radius:3px;font-weight:600";
  const textStyle =
    level === "error" ? "color:#f87171" : level === "warn" ? "color:#fbbf24" : "color:#cbd5e1";

  if (level === "error") {
    originalConsoleError?.(prefix, tagStyle, textStyle, message);
  } else {
    // eslint-disable-next-line no-console
    console.log(prefix, tagStyle, textStyle, message);
  }

  pushNotice({ kind: level, text: message });
};

export const clearDebugLog = () => {
  events = [];
  notices = [];
  notify();
};

const pushEvent = (event: NetEvent) => {
  events = [event, ...events].slice(0, MAX_EVENTS);
  notify();
};

const patchEvent = (id: number, patch: Partial<NetEvent>) => {
  const index = events.findIndex((event) => event.id === id);
  if (index === -1) return;
  const next = events.slice();
  next[index] = { ...next[index], ...patch };
  events = next;
  notify();
};

const pushNotice = (notice: Omit<DebugNotice, "id" | "at">) => {
  notices = [
    { ...notice, id: ++seq, at: Date.now() },
    ...notices,
  ].slice(0, MAX_NOTICES);
  notify();
};

const normalizeUrl = (raw: string) => {
  try {
    const url = new URL(raw, window.location.href);
    if (url.origin === window.location.origin) {
      return { href: `${url.pathname}${url.search}`, origin: "relative" as const };
    }
    return { href: url.href, origin: "absolute" as const };
  } catch {
    return { href: raw, origin: "other" as const };
  }
};

const looksLikeAbsolute = (raw: string) => /^https?:\/\//i.test(raw.trim());

const collapseIdSegments = (pathname: string) =>
  pathname
    .split("/")
    .map((segment) => (/\d{2,}/.test(segment) ? "{id}" : segment))
    .join("/");

const summarizeJson = (value: unknown): string => {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    const preview = JSON.stringify(value.slice(0, 2));
    const truncated = preview.length > MAX_BODY_CHARS ? `${preview.slice(0, MAX_BODY_CHARS)}...` : preview;
    return `Array(${value.length}) ${truncated}`;
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record);
    const pageMeta = keys.filter((key) =>
      ["totalElements", "totalPages", "number", "size", "page"].includes(key),
    );
    const meta = pageMeta.length
      ? ` {${pageMeta.map((key) => `${key}=${JSON.stringify(record[key])}`).join(", ")}}`
      : "";
    const nestedArray = keys.find((key) => Array.isArray(record[key]));
    const nestedNote = nestedArray
      ? ` .${nestedArray}=Array(${(record[nestedArray] as unknown[]).length})`
      : "";
    return `{keys: ${keys.length} [${keys.slice(0, 12).join(", ")}]}${meta}${nestedNote}`;
  }
  const text = JSON.stringify(value);
  return text.length > MAX_BODY_CHARS ? `${text.slice(0, MAX_BODY_CHARS)}...` : text;
};

const summarizeBody = async (response: Response) => {
  const contentType = response.headers.get("content-type") || "";
  const type = contentType.split(";")[0].trim() || "unknown";
  const contentLength = response.headers.get("content-length");

  if (type === "text/event-stream") {
    return { summary: "(streaming response body not buffered)", type, bytes: undefined };
  }
  if (type.startsWith("image/") || type.startsWith("video/") || type.startsWith("audio/")) {
    return { summary: `(binary ${type})`, type, bytes: Number(contentLength) || undefined };
  }

  try {
    const text = await response.clone().text();
    const bytes = new Blob([text]).size;
    if (!text) return { summary: "(empty body)", type, bytes: 0 };
    try {
      return { summary: summarizeJson(JSON.parse(text)), type, bytes };
    } catch {
      const clipped = text.length > MAX_BODY_CHARS ? `${text.slice(0, MAX_BODY_CHARS)}...` : text;
      return { summary: clipped, type, bytes };
    }
  } catch {
    return { summary: "(body could not be read)", type, bytes: undefined };
  }
};

const summarizeRequest = (init?: RequestInit) => {
  const body = init?.body;
  if (body === undefined || body === null) return undefined;
  if (typeof body === "string") {
    try {
      return summarizeJson(JSON.parse(body));
    } catch {
      return body.length > MAX_BODY_CHARS ? `${body.slice(0, MAX_BODY_CHARS)}...` : body;
    }
  }
  if (body instanceof FormData) {
    const files: string[] = [];
    for (const [key, value] of body.entries()) {
      files.push(
        value instanceof File ? `${key}=File(${value.name},${value.size}B)` : `${key}=${String(value).slice(0, 40)}`,
      );
    }
    return `FormData{${files.join(", ")}}`;
  }
  if (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams) {
    return `URLSearchParams{${body.toString().slice(0, 300)}}`;
  }
  return `(${body.constructor?.name || "body"})`;
};

/**
 * Chrome attributes a console message to the function that *called* console.*.
 * Since we patch those methods, every message would point at this file. So we
 * re-derive the real call site by walking past our own frames.
 */
const resolveSource = (): string | undefined => {
  const stack = new Error().stack;
  if (!stack) return undefined;
  const frame = stack
    .split("\n")
    .slice(1)
    .map((line) => line.trim())
    .find(
      (line) =>
        line.includes("debugLogger") === false &&
        /https?:\/\/|file:|\.ts:|\.tsx:|\.js:/.test(line),
    );
  if (!frame) return undefined;
  return frame
    .replace(/^at\s+/, "")
    .replace(/.*?(https?:\/\/.*|file:.*|[\w./\\-]+\.tsx?:\d+:\d+)$/, "$1");
};

/**
 * Third-party development chatter that is expected and not actionable for
 * diagnosing backend fetches. Filtered out of the overlay but still printed
 * to the real console untouched.
 */
const NOISE_PATTERNS = [
  /React Router Future Flag Warning/i,
  /Download the React DevTools/i,
];

const isNoise = (text: string) => NOISE_PATTERNS.some((pattern) => pattern.test(text));

const methodColors: Record<string, string> = {
  GET: "text-emerald-400",
  POST: "text-amber-400",
  PUT: "text-sky-400",
  PATCH: "text-violet-400",
  DELETE: "text-rose-400",
};

export const methodColor = (method: string) =>
  methodColors[method.toUpperCase()] || "text-muted-foreground";

export const installDebugFetch = () => {
  if (installed) return;
  installed = true;

  originalFetch = window.fetch.bind(window);
  originalConsoleError = console.error.bind(console);

  // console.warn is deliberately left unpatched. Chrome attributes a console
  // message to the function that called it, so wrapping it makes third-party
  // warnings (e.g. React Router future-flag notices) appear to originate here.
  // Errors are still intercepted because they are the ones worth surfacing.
  console.error = (...args: unknown[]) => {
    const text = args.map((arg) => (typeof arg === "string" ? arg : safeStringify(arg))).join(" ");
    if (!isNoise(text)) {
      pushNotice({
        kind: "error",
        text,
        source: args.find((arg) => arg instanceof Error)?.stack || resolveSource(),
      });
    }
    originalConsoleError?.(...args);
  };

  window.addEventListener("error", (event) => {
    if (isNoise(event.message)) return;
    pushNotice({ kind: "error", text: event.message, stack: event.error?.stack });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const text = reason instanceof Error ? reason.message : safeStringify(reason);
    if (isNoise(text)) return;
    pushNotice({
      kind: "rejection",
      text,
      stack: reason instanceof Error ? reason.stack : undefined,
    });
  });

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const rawUrl =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input instanceof Request
            ? input.url
            : String(input);

    const method = (
      init?.method ??
      (input instanceof Request ? input.method : undefined) ??
      "GET"
    ).toUpperCase();

    const effectiveInit: RequestInit | undefined =
      input instanceof Request && !init
        ? {
            method: input.method,
            headers: input.headers,
            body: input.body,
          }
        : init;

    const { href, origin } = normalizeUrl(rawUrl);
    let endpointPath = href;
    try {
      endpointPath = new URL(rawUrl, window.location.href).pathname;
    } catch {
      endpointPath = href;
    }

    const id = ++seq;
    const startedAt = performance.now();
    const startedWall = Date.now();
    const event: NetEvent = {
      id,
      startedAt: startedWall,
      method,
      url: href,
      label: `${method} ${collapseIdSegments(endpointPath)}`,
      origin: looksLikeAbsolute(rawUrl) ? "absolute" : origin,
      phase: "pending",
      requestBody: summarizeRequest(effectiveInit),
    };

    const hasAuth = Boolean(
      (effectiveInit?.headers as Record<string, string> | undefined)?.Authorization ||
        (input instanceof Request && input.headers.get("Authorization")),
    );

    pushEvent(event);
    originalConsoleError?.(
      `%c[NAP-NET]%c ▶ ${method} ${href}${event.requestBody ? ` %c${event.requestBody}` : ""}`,
      "background:#1f2937;color:#f9fafb;padding:2px 6px;border-radius:3px;font-weight:600",
      "color:#9ca3af",
      "color:#93c5fd",
    );

    try {
      const response = await originalFetch(input, init);
      const durationMs = Math.round(performance.now() - startedAt);
      const { summary, type, bytes } = await summarizeBody(response);

      patchEvent(id, {
        finishedAt: Date.now(),
        durationMs,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        phase: "done",
        responseSummary: summary,
        responseType: type,
        bytes,
      });

      const tone = response.ok ? "color:#34d399" : "color:#f87171";
      originalConsoleError?.(
        `%c[NAP-NET]%c ◀ ${response.status} ${response.statusText || ""} %c${durationMs}ms%c %c${type}%c ${summary}${hasAuth ? " %c(auth)" : ""}`,
        "background:#1f2937;color:#f9fafb;padding:2px 6px;border-radius:3px;font-weight:600",
        tone,
        "color:#a1a1aa",
        "color:#a1a1aa",
        "color:#d4d4d8",
        hasAuth ? "color:#fcd34d" : "color:transparent",
      );

      return response;
    } catch (error) {
      const durationMs = Math.round(performance.now() - startedAt);
      const err = error as Error;
      patchEvent(id, {
        finishedAt: Date.now(),
        durationMs,
        phase: "error",
        ok: false,
        errorType: err?.name || "Error",
        error: err?.message || String(error),
      });

      originalConsoleError?.(
        `%c[NAP-NET]%c ✖ ${method} ${href} failed after %c${durationMs}ms%c — ${err?.name}: ${err?.message}`,
        "background:#1f2937;color:#f9fafb;padding:2px 6px;border-radius:3px;font-weight:600",
        "color:#f87171;font-weight:600",
        "color:#a1a1aa",
        "color:#fca5a5",
      );

      throw error;
    }
  };
};

const safeStringify = (value: unknown) => {
  try {
    if (value instanceof Error) return `${value.name}: ${value.message}`;
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export const getDebugStats = (): DebugStat => {
  const buckets = new Map<string, DebugStat["byEndpoint"][number]>();

  for (const event of events) {
    let endpointPath = event.url;
    try {
      endpointPath = new URL(event.url, window.location.href).pathname;
    } catch {
      /* keep raw */
    }
    const key = `${event.method} ${collapseIdSegments(endpointPath)}`;
    const bucket = buckets.get(key) || {
      key,
      method: event.method,
      label: `${event.method} ${collapseIdSegments(endpointPath)}`,
      count: 0,
      failed: 0,
      avgMs: 0,
      lastPhase: event.phase,
    };
    bucket.count += 1;
    if (event.phase === "error" || event.ok === false) bucket.failed += 1;
    if (event.durationMs !== undefined) {
      bucket.avgMs = Math.round((bucket.avgMs * (bucket.count - 1) + event.durationMs) / bucket.count);
    }
    bucket.lastPhase = event.phase;
    bucket.lastStatus = event.status;
    buckets.set(key, bucket);
  }

  const ok = events.filter((event) => event.ok === true).length;
  const failed = events.filter((event) => event.phase === "error" || event.ok === false).length;

  return {
    total: events.length,
    ok,
    failed,
    pending: events.filter((event) => event.phase === "pending").length,
    inFlight: events.filter((event) => event.phase === "pending").length,
    byEndpoint: [...buckets.values()].sort((a, b) => b.count - a.count || a.key.localeCompare(b.key)),
  };
};

export const debugConfig = {
  apiBaseUrl: apiBaseUrl,
  origin: typeof window !== "undefined" ? window.location.origin : "(ssr)",
  sessionStartedAt: Date.now(),
};