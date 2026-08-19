import '@vly-ai/integrations';
import { Toaster } from "@/components/ui/sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { ThemeProvider } from "@/components/theme-provider";
import { FeatureFlagProvider } from "@/components/dashboard/feature-flags";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import React, { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";
import { CONVEX_URL, DEMO_MODE } from "@/lib/env";

// Lazy load route components for better code splitting
const Landing = lazy(() => import("./pages/Landing.tsx"));
const AuthPage = lazy(() => import("./pages/Auth.tsx"));
const Setup = lazy(() => import("./pages/Setup.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const AppShell = lazy(() =>
  import("@/components/dashboard/app-shell").then((m) => ({ default: m.AppShell })),
);
const OverviewPage = lazy(() => import("./pages/dashboard/overview.tsx"));
const CrownPage = lazy(() => import("./pages/dashboard/crown.tsx"));
const ProvidersPage = lazy(() => import("./pages/dashboard/providers.tsx"));
const CronsPage = lazy(() => import("./pages/dashboard/crons.tsx"));
const ActivityPage = lazy(() => import("./pages/dashboard/activity.tsx"));
const BrainPage = lazy(() => import("./pages/dashboard/brain.tsx"));
const ConsolePage = lazy(() => import("./pages/dashboard/console.tsx"));
const BotsPage = lazy(() => import("./pages/dashboard/bots.tsx"));
const AgentsPage = lazy(() => import("./pages/dashboard/agents.tsx"));
const HealthPage = lazy(() => import("./pages/dashboard/health.tsx"));
const SettingsPage = lazy(() => import("./pages/dashboard/settings.tsx"));

// Simple loading fallback for route transitions
function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
  );
}

/** Silent error boundary — if VlyToolbar crashes it renders nothing instead of
 *  crashing the whole app (e.g. hook errors in WebContainer environment). */
class ToolbarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    console.warn("[VlyToolbar] Caught error, toolbar disabled:", err.message);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/** Hard guard so runtime errors never leave the preview as a blank page. */
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string; stack: string }
> {
  state = { hasError: false, message: "", stack: "" };
  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error.message || "Unknown runtime error",
      stack: error.stack || "",
    };
  }
  componentDidCatch(err: Error) {
    console.error("[WebContainer preview] Root crash:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
          <div className="max-w-lg text-center">
            <p className="text-sm font-semibold">Preview runtime error</p>
            <p className="mt-2 text-xs text-muted-foreground break-words">
              {this.state.message}
            </p>
            {this.state.stack && (
              <pre className="mt-3 text-left text-[10px] leading-4 text-muted-foreground/80 max-h-40 overflow-auto rounded border border-border/60 p-2">
                {this.state.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const convex = new ConvexReactClient(CONVEX_URL);



function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

/** Animated page wrapper — fades + slides on route change. */
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex-1"
      >
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/setup" element={<Setup />} />
          <Route
            path="/auth"
            element={<AuthPage redirectAfterAuth="/dashboard" />}
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="crown" element={<CrownPage />} />
            <Route path="providers" element={<ProvidersPage />} />
            <Route path="crons" element={<CronsPage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="brain" element={<BrainPage />} />
            <Route path="console" element={<ConsolePage />} />
            <Route path="bots" element={<BotsPage />} />
            <Route path="agents" element={<AgentsPage />} />
            <Route path="health" element={<HealthPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  );
}


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <ToolbarErrorBoundary>
        <VlyToolbar />
      </ToolbarErrorBoundary>
      <ThemeProvider>
        <FeatureFlagProvider>
          <MotionConfig reducedMotion="user">
            <ConvexAuthProvider client={convex}>
              <BrowserRouter>
                <RouteSyncer />
                <Suspense fallback={<RouteLoading />}>
                  <AnimatedRoutes />
                </Suspense>
              </BrowserRouter>
              <Toaster />
            </ConvexAuthProvider>
          </MotionConfig>
        </FeatureFlagProvider>
      </ThemeProvider>
    </RootErrorBoundary>
  </StrictMode>,
);