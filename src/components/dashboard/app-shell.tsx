import { Outlet } from "react-router";
import { Sidebar, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { CommandPanelProvider } from "./command-panel";
import { DashboardHeader } from "./dashboard-header";

export function AppShell() {
  return (
    <SidebarProvider defaultOpen>
      <CommandPanelProvider>
        <Sidebar collapsible="icon">
          <AppSidebar />
        </Sidebar>
        <SidebarInset>
          <DashboardHeader />
          <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-8 md:px-6 lg:px-8">
            <Outlet />
          </main>
        </SidebarInset>
      </CommandPanelProvider>
    </SidebarProvider>
  );
}