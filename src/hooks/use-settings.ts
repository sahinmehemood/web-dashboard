import { useCallback, useEffect, useMemo, useState } from "react";

export type Density = "default" | "compact";
export type Radius = "none" | "sm" | "md" | "lg";

const DENSITY_KEY = "hermes-density";
const REFRESH_KEY = "hermes-refresh-secs";
const AUTOREFRESH_KEY = "hermes-autorefresh";
const RADIUS_KEY = "hermes-radius";

const RADIUS_VALUE: Record<Radius, string> = {
  none: "0rem",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.875rem",
};

export interface Settings {
  density: Density;
  refreshSeconds: number;
  autoRefresh: boolean;
  radius: Radius;
}

function loadSettings(): Settings {
  const density: Density =
    typeof localStorage !== "undefined" &&
    localStorage.getItem(DENSITY_KEY) === "compact"
      ? "compact"
      : "default";
  const refreshSeconds = Number(
    localStorage.getItem(REFRESH_KEY) ?? 30,
  );
  const autoRefresh =
    (localStorage.getItem(AUTOREFRESH_KEY) ?? "true") === "true";
  const radius = (localStorage.getItem(RADIUS_KEY) as Radius) ?? "md";
  return {
    density,
    refreshSeconds: [15, 30, 60, 300].includes(refreshSeconds)
      ? refreshSeconds
      : 30,
    autoRefresh,
    radius: RADIUS_VALUE[radius] ? radius : "md",
  };
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-density", settings.density);
    root.style.setProperty("--radius", RADIUS_VALUE[settings.radius]);
    try {
      localStorage.setItem(DENSITY_KEY, settings.density);
      localStorage.setItem(REFRESH_KEY, String(settings.refreshSeconds));
      localStorage.setItem(AUTOREFRESH_KEY, String(settings.autoRefresh));
      localStorage.setItem(RADIUS_KEY, settings.radius);
    } catch {
      /* ignore */
    }
  }, [settings]);

  const setDensity = useCallback(
    (density: Density) => setSettings((s) => ({ ...s, density })),
    [],
  );
  const setRefreshSeconds = useCallback(
    (refreshSeconds: number) => setSettings((s) => ({ ...s, refreshSeconds })),
    [],
  );
  const setAutoRefresh = useCallback(
    (autoRefresh: boolean) => setSettings((s) => ({ ...s, autoRefresh })),
    [],
  );
  const setRadius = useCallback(
    (radius: Radius) => setSettings((s) => ({ ...s, radius })),
    [],
  );

  const value = useMemo(
    () => ({
      ...settings,
      setDensity,
      setRefreshSeconds,
      setAutoRefresh,
      setRadius,
    }),
    [settings, setDensity, setRefreshSeconds, setAutoRefresh, setRadius],
  );

  return value;
}

export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
