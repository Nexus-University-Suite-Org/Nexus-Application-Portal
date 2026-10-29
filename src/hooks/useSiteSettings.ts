import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/apiUrl";
import { logDebug } from "@/lib/debugLogger";

export type SiteSettings = Record<string, string>;

let cached: SiteSettings | null = null;
let inFlight: Promise<SiteSettings> | null = null;

/** Deduplicates diagnostics so a re-render can't repeat the same warning. */
const reported = new Set<string>();

const reportOnce = (id: string, level: "info" | "warn" | "error", message: string) => {
  if (reported.has(id)) return;
  reported.add(id);
  logDebug(level, message);
};

/**
 * Single shared request for `/content/site-settings`.
 *
 * Every page used to fetch this independently, so a route like /about issued
 * three or four identical ~1.5s requests and blocked its own content on each.
 * The in-flight promise is shared and the parsed result cached, so the network
 * call happens once per session and late subscribers resolve immediately.
 */
const loadSiteSettings = (): Promise<SiteSettings> => {
  if (cached) return Promise.resolve(cached);
  if (inFlight) return inFlight;

  inFlight = fetch(apiUrl("content/site-settings"))
    .then((res) => {
      if (!res.ok) throw new Error(`site-settings responded ${res.status}`);
      return res.json() as Promise<SiteSettings>;
    })
    .then((data) => {
      cached = data;
      return data;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
};

/** Test/admin escape hatch: forces the next mount to hit the network again. */
export const clearSiteSettingsCache = () => {
  cached = null;
  inFlight = null;
};

/**
 * Reads CMS-editable site settings.
 *
 * Pass `keys` to declare what the caller expects. Anything absent is reported
 * through the debug overlay, which distinguishes "not configured yet" from
 * "fetch failed" — previously both looked identical because callers swallowed
 * the error and fell back to hardcoded copy.
 */
export const useSiteSettings = (options?: { keys?: string[]; scope?: string }) => {
  const keys = options?.keys;
  const scope = options?.scope;
  // Callers pass an inline array literal, so identity changes every render.
  // Depend on the joined value instead to avoid refetching on each one.
  const keysSignature = keys?.join(",");

  const [settings, setSettings] = useState<SiteSettings>(() => cached || {});
  const [status, setStatus] = useState<"loading" | "ready" | "error">(cached ? "ready" : "loading");
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    loadSiteSettings()
      .then((data) => {
        if (!active) return;
        setSettings(data);
        setStatus("ready");

        if (keys?.length) {
          const missing = keys.filter((key) => !data[key]);
          if (missing.length) {
            reportOnce(
              `${scope || "site-settings"}:${missing.join(",")}`,
              "warn",
              `${scope || "Site settings"} is missing ${missing.length} of ${keys.length} key(s); ` +
                `rendering hardcoded fallbacks — ${missing.join(", ")}`,
            );
          } else {
            reportOnce(`${scope || "site-settings"}:complete`, "info", `${scope || "Site settings"}: all ${keys.length} key(s) resolved from the API.`);
          }
        }
      })
      .catch((err: Error) => {
        if (!active) return;
        setStatus("error");
        setError(err);
        reportOnce(
          `${scope || "site-settings"}:error:${err.message}`,
          "error",
          `${scope || "Site settings"} failed to load (${err.message}); rendering hardcoded fallbacks.`,
        );
      });

    return () => {
      active = false;
    };
  }, [keysSignature, scope]);

  return { settings, status, error };
};

/** Escapes JSON-valued settings before handing them to JSON.parse. */
export const parseJsonSetting = <T,>(raw: string | undefined, fallback: T): T => {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
};
