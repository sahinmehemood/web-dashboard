import { clamp } from "@/lib/formatters";

/**
 * Deterministic pseudo-random walk for sparkline history.
 * The same (seed, points) always yields the same series, so re-renders and
 * remounts never jitter. Good for demo telemetry charts.
 */
export function makeHistory(
  seed: number,
  points: number,
  base: number,
  variance = 8,
  min = 0,
  max = 100,
): number[] {
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  let value = base;
  const out: number[] = [];
  for (let i = 0; i < points; i++) {
    value = clamp(value + (rnd() - 0.45) * variance * 2, min, max);
    out.push(Math.round(value));
  }
  return out;
}

export type UptimeTone = "operational" | "degraded" | "outage";

/**
 * Deterministic 90-day uptime series. Each day gets a status tone.
 * Seeded so the bar never jitters between renders. Mostly operational
 * with occasional degraded/outage windows to mirror a real status page.
 */
export function makeUptimeHistory(seed: number, days = 90): UptimeTone[] {
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const out: UptimeTone[] = [];
  for (let i = 0; i < days; i++) {
    const r = rnd();
    if (r > 0.97) out.push("outage");
    else if (r > 0.9) out.push("degraded");
    else out.push("operational");
  }
  return out;
}

export function uptimePercent(series: UptimeTone[]): number {
  if (series.length === 0) return 100;
  const good = series.filter((t) => t === "operational").length;
  return Math.round(((good + series.filter((t) => t === "degraded").length * 0.5) / series.length) * 1000) / 10;
}