import { useCallback, useEffect, useMemo, useState } from "react";

export type Density = "default" | "compact";

const DENSITY_KEY = "hermes-density";
const REFRESH_KEY = "hermes-refresh-secs";
const AUTOREFRESH_KEY = "hermes-autorefresh";

export interface Settings {
  density: Density;
  refreshSeconds: number;
  autoRefresh: boolean;
}

function loadSettings(): Settings {
  const density: Density =
    (typeof localStorage !== "undefined" &&
      localStorage.getItem(DENSITY_KEY)) === "compact"
      ? "compact"
      : "default";
  const refreshSeconds = Number(
    localStorage.getItem(REFRESH_KEY) ?? 30,
  );
  const autoRefresh =
    (localStorage.getItem(AUTOREFRESH_KEY) ?? "true") === "true";
  return {
    density,
    refreshSeconds: [15, 30, 60, 300].includes(refreshSeconds)
      ? refreshSeconds
      : 30,
    autoRefresh,
  };
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-density", settings.density);
    try {
      localStorage.setItem(DENSITY_KEY, settings.density);
      localStorage.setItem(REFRESH_KEY, String(settings.refreshSeconds));
      localStorage.setItem(AUTOREFRESH_KEY, String(settings.autoRefresh));
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

  const value = useMemo(
    () => ({
      ...settings,
      setDensity,
      setRefreshSeconds,
      setAutoRefresh,
    }),
    [settings, setDensity, setRefreshSeconds, setAutoRefresh],
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