import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface FeatureFlags {
  /** Show the system topology map on health page */
  topologyMap: boolean;
  /** Show the deployment pipeline on overview */
  deploymentPipeline: boolean;
  /** Show the progress rings on stat cards */
  progressRings: boolean;
  /** Show animated counters */
  animatedCounters: boolean;
  /** Show the quick status bar in header */
  quickStatusBar: boolean;
  /** Show the service dependency map */
  dependencyMap: boolean;
  /** Enable page transitions */
  pageTransitions: boolean;
  /** Show the device identity panel */
  devicePanel: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  topologyMap: true,
  deploymentPipeline: true,
  progressRings: true,
  animatedCounters: true,
  quickStatusBar: true,
  dependencyMap: true,
  pageTransitions: true,
  devicePanel: true,
};

const FeatureFlagContext = createContext<{
  flags: FeatureFlags;
  setFlag: (key: keyof FeatureFlags, value: boolean) => void;
  resetFlags: () => void;
}>({
  flags: DEFAULT_FLAGS,
  setFlag: () => {},
  resetFlags: () => {},
});

const STORAGE_KEY = "hermes-feature-flags";

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlags>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_FLAGS, ...JSON.parse(stored) } : DEFAULT_FLAGS;
    } catch {
      return DEFAULT_FLAGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
    } catch { /* noop */ }
  }, [flags]);

  const setFlag = (key: keyof FeatureFlags, value: boolean) => {
    setFlags((prev) => ({ ...prev, [key]: value }));
  };

  const resetFlags = () => setFlags(DEFAULT_FLAGS);

  return (
    <FeatureFlagContext.Provider value={{ flags, setFlag, resetFlags }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags() {
  return useContext(FeatureFlagContext);
}

/** Conditional render helper */
export function Feature({
  name,
  children,
  fallback = null,
}: {
  name: keyof FeatureFlags;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { flags } = useFeatureFlags();
  return flags[name] ? <>{children}</> : <>{fallback}</>;
}
