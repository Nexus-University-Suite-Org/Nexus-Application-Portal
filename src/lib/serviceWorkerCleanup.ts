/**
 * Stale service workers on a shared dev origin.
 *
 * This project has never shipped a service worker, but its dev server runs on
 * ``localhost:5173`` -- the same origin every other Vite project uses. A worker
 * registered there by another project keeps intercepting requests for this app;
 * when its fetch handler rejects, navigations (e.g. to ``/programs``) fail with
 * "Failed to convert value to 'Response'" and the browser reports a network
 * error for the FetchEvent.
 *
 * Because this app owns no worker, any registration for this origin is stale,
 * so it is unregistered on startup. Development only: a production origin is
 * dedicated to this app and may legitimately run one later.
 */
const RELOAD_FLAG = "stale-sw-cleared";

export function unregisterStaleServiceWorkers(): void {
  if (!import.meta.env.DEV) return;
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      if (registrations.length === 0) return;
      return Promise.all(
        registrations.map((registration) =>
          registration.unregister().catch(() => false),
        ),
      ).then(() => {
        // A just-unregistered worker keeps controlling the current page until
        // it unloads, so its broken fetch handler would still intercept the
        // next navigation. Reload once (guarded to avoid a loop) so the page
        // comes back with no worker.
        if (
          navigator.serviceWorker.controller &&
          !sessionStorage.getItem(RELOAD_FLAG)
        ) {
          sessionStorage.setItem(RELOAD_FLAG, "1");
          window.location.reload();
        }
      });
    })
    .catch(() => {});
}
