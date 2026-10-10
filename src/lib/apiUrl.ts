/**
 * Single source of truth for backend URL construction.
 *
 * The backend is mounted under the `/api` context path, so every request must
 * resolve to `<base>/api/v1/<path>`.
 *
 * This exists because the codebase previously had two incompatible conventions
 * behind one `VITE_API_BASE_URL`:
 *
 *   - some modules defaulted to `/api` and appended `v1/...`
 *   - others defaulted to `/api/v1` and appended a bare path
 *
 * No single base value can satisfy both. Setting `VITE_API_BASE_URL` to a bare
 * host (e.g. `https://backend-production-b8c2b.up.railway.app`) overrode the
 * correct `/api` defaults and made every env-driven request hit `/v1/...`,
 * which Spring answers with `500 No static resource`. Components that hardcoded
 * a relative `/api/v1/...` kept working, which made it look intermittent.
 *
 * `apiUrl` is deliberately forgiving about its input so a call site cannot
 * reintroduce the bug: a leading `/` and a redundant `v1/` prefix are both
 * stripped, and the `/api` context path is guaranteed.
 */

const rawBase = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";

const normalizeBase = (raw: string) => {
  const trimmed = raw.replace(/\/+$/, "");
  if (!trimmed) return "/api";
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

export const apiBaseUrl = normalizeBase(rawBase);

/**
 * Build a backend URL for a path below the `/v1` prefix.
 *
 * @example apiUrl("content/courses")      // "/api/v1/content/courses"
 * @example apiUrl("v1/auth/otp/send")    // "/api/v1/auth/otp/send"
 */
export const apiUrl = (path: string) => {
  const cleaned = path.replace(/^\/+/, "").replace(/^v1\//, "");
  return `${apiBaseUrl}/v1/${cleaned}`;
};

/**
 * Nexus Admissions Dashboard (NAD) base URL.
 *
 * The application form's course selection reads the programme catalogue that
 * the admissions dashboard publishes (stored in the NAD database), so it needs
 * a separate base from the NAP backend. Unlike `VITE_API_BASE_URL` there is no
 * same-origin reverse proxy for this service, so it defaults to the deployed
 * NAD origin. The public endpoints allow any origin, so no CORS setup is needed.
 */
const rawNadBase = import.meta.env.VITE_NAD_API_BASE_URL?.trim() ?? "";

const normalizeNadBase = (raw: string) => {
  const trimmed = raw.replace(/\/+$/, "");
  if (!trimmed) return "https://admissions-backend-production-0985.up.railway.app/api";
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

export const nadApiBaseUrl = normalizeNadBase(rawNadBase);

/**
 * Build a NAD URL for a path below the `/v1` prefix.
 *
 * @example nadApiUrl("public/programs") // "<nad>/api/v1/public/programs"
 */
export const nadApiUrl = (path: string) => {
  const cleaned = path.replace(/^\/+/, "").replace(/^v1\//, "");
  return `${nadApiBaseUrl}/v1/${cleaned}`;
};
