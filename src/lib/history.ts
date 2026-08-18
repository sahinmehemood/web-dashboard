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

export function smoothStep(x: number): number {
  return x * x * (3 - 2 * x);
}