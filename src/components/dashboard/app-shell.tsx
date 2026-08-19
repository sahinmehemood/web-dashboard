import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { Sidebar, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { CommandPanelProvider } from "./command-panel";
import { ShortcutsDialogProvider } from "./keyboard-shortcuts-dialog";
import { DashboardHeader } from "./dashboard-header";

const NAV_KEYS: Record<string, string> = {
  o: "/dashboard",
  c: "/dashboard/crown",
  p: "/dashboard/providers",
  r: "/dashboard/crons",
  a: "/dashboard/activity",
  e: "/dashboard/agents",
  b: "/dashboard/brain",
  n: "/dashboard/console",
  t: "/dashboard/bots",
  h: "/dashboard/health",
  s: "/dashboard/settings",
};

const NUMBER_KEYS: Record<string, string> = {
  "1": "/dashboard",
  "2": "/dashboard/crown",
  "3": "/dashboard/providers",
  "4": "/dashboard/crons",
  "5": "/dashboard/activity",
  "6": "/dashboard/brain",
  "7": "/dashboard/console",
  "8": "/dashboard/bots",
  "9": "/dashboard/health",
  "0": "/dashboard/settings",
};

function NavigationShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    let pendingG = false;
    let gTimer: ReturnType<typeof setTimeout> | null = null;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
      // Don't hijack keys while a dialog/palette is open (e.g. typing in the cmdk input).
      if (document.querySelector('[role="dialog"]')) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (pendingG && NAV_KEYS[e.key.toLowerCase()]) {
        e.preventDefault();
        navigate(NAV_KEYS[e.key.toLowerCase()]);
        pendingG = false;
        if (gTimer) clearTimeout(gTimer);
        return;
      }
      if (NUMBER_KEYS[e.key]) {
        e.preventDefault();
        navigate(NUMBER_KEYS[e.key]);
        return;
      }
      if (e.key.toLowerCase() === "g") {
        pendingG = true;
        gTimer = setTimeout(() => (pendingG = false), 1200);
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      if (gTimer) clearTimeout(gTimer);
    };
  }, [navigate]);

  return null;
}

export function AppShell() {
  return (
    <SidebarProvider defaultOpen>
      <CommandPanelProvider>
        <ShortcutsDialogProvider>
          <NavigationShortcuts />
          <Sidebar collapsible="icon">
            <AppSidebar />
          </Sidebar>
          <SidebarInset className="min-w-0 overflow-clip">
            <DashboardHeader />
            <div className="mx-auto w-full max-w-[1440px] flex-1 min-w-0 px-4 py-8 md:px-6 lg:px-8">
              <Outlet />
            </div>
          </SidebarInset>
        </ShortcutsDialogProvider>
      </CommandPanelProvider>
    </SidebarProvider>
  );
}
