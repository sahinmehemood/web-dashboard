/**
 * Demo mode is auto-enabled when no Convex deployment URL is configured.
 * In this mode the UI renders entirely from the bundled fallback demo data
 * (see src/lib/demo.ts) and auth gating is skipped, so the dashboard can be
 * viewed as a static site without a backend. Set VITE_CONVEX_URL to switch to
 * live mode.
 */
export const DEMO_MODE = !import.meta.env.VITE_CONVEX_URL;

/** Fallback URL so the Convex client can be constructed even without a backend. */
export const CONVEX_URL =
  import.meta.env.VITE_CONVEX_URL || "https://demo.invalid";
