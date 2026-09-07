// Shared helpers used by both pages.

// Vite injects the configured base path here (e.g. "/my-repo/" on GitHub
// Pages, or "/" locally). We use it to build correct URLs to public assets
// and to link between pages regardless of where the site is hosted.
export const BASE = import.meta.env.BASE_URL;

/** Build a URL to a file in the public/ folder, respecting the base path. */
export function asset(path) {
  const clean = String(path).replace(/^\/+/, '');
  return BASE + clean;
}

/** Build an internal page link, respecting the base path. */
export function pageLink(path) {
  const clean = String(path).replace(/^\/+/, '');
  return BASE + clean;
}

/** Load the generated manifest. Returns { albums, ... }. */
export async function loadManifest() {
  const res = await fetch(asset('albums.json'), { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Failed to load manifest (${res.status})`);
  return res.json();
}

/** Read a query param from the current URL. */
export function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/** Escape text for safe insertion into HTML. */
export function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
