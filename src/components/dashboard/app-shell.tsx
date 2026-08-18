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
  b: "/dashboard/brain",
  n: "/dashboard/console",
  t: "/dashboard/bots",
  h: "/dashboard/health",
  s: "/dashboard/settings",
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
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (pendingG && NAV_KEYS[e.key.toLowerCase()]) {
        e.preventDefault();
        navigate(NAV_KEYS[e.key.toLowerCase()]);
        pendingG = false;
        if (gTimer) clearTimeout(gTimer);
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
          <SidebarInset>
            <DashboardHeader />
            <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-8 md:px-6 lg:px-8">
              <Outlet />
            </main>
          </SidebarInset>
        </ShortcutsDialogProvider>
      </CommandPanelProvider>
    </SidebarProvider>
  );
}
