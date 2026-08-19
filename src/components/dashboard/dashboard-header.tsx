import { useLocation, useNavigate } from "react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { toneBg, toneText } from "@/lib/status";
import { DEMO_MODE } from "@/lib/env";
import { useNow } from "@/hooks/use-settings";
import { useActivity, useTelemetry, useCrown } from "@/hooks/use-dashboard";
import { useCommandPanel } from "@/components/dashboard/command-panel";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { isAnyDemo } from "@/hooks/use-dashboard";
import { formatClock } from "@/lib/formatters";
import {
  Bell,
  History,
  Home,
  LogOut,
  Moon,
  Search,
  Settings,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/crown": "Crown",
  "/dashboard/providers": "Providers",
  "/dashboard/crons": "Crons",
  "/dashboard/activity": "Activity",
  "/dashboard/agents": "Agents",
  "/dashboard/brain": "Brain",
  "/dashboard/console": "Console",
  "/dashboard/bots": "Bots",
  "/dashboard/health": "Health",
  "/dashboard/settings": "Settings",
};

function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const email = user?.email ?? "Guest";
  const name = user?.name ?? email.split("@")[0];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 rounded-full">
          <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold uppercase">
            {name.slice(0, 2)}
          </span>
          <span className="sr-only">Open user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">{name}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
          <Settings className="size-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/")}>
          <Home className="size-4" />
          Landing page
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Notifications() {
  const navigate = useNavigate();
  const { data: activity } = useActivity(20);
  const alerts = activity.filter((e) => e.level === "error" || e.level === "warning");
  const recent = activity.slice(0, 8);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Notifications, ${alerts.length} alerts`}
          className="relative"
        >
          <Bell className="size-4" />
          {alerts.length > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-red-500" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-medium">Notifications</span>
          {alerts.length > 0 && (
            <Badge variant="outline" className={cn("text-[10px] font-medium", toneText.danger)}>
              {alerts.length} alert{alerts.length > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <ActivityFeed events={recent} className="max-h-80 overflow-y-auto px-4" />
        <div className="border-t border-border p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center gap-2 text-muted-foreground"
            onClick={() => navigate("/dashboard/activity")}
          >
            <History className="size-3.5" />
            View all activity
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

import {
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  Cpu,
  Signal,
} from "lucide-react";

function QuickStatus() {
  const { data: t } = useTelemetry();
  const { data: crown } = useCrown();
  const runningCount = crown.services.filter((s: { status: string }) => s.status === "run").length;
  const totalCount = crown.services.length;

  const batteryTone =
    t.batteryPercent >= 60 ? "text-emerald-600 dark:text-emerald-400" :
    t.batteryPercent >= 30 ? "text-amber-600 dark:text-amber-400" :
    "text-red-600 dark:text-red-400";

  return (
    <div className="hidden items-center gap-3 rounded-lg border border-border bg-secondary/40 px-2.5 py-1 text-[11px] tabular-nums text-muted-foreground xl:flex">
      <span className={cn("flex items-center gap-1", batteryTone)} title={`Battery: ${t.batteryPercent}%`}>
        {t.batteryPercent >= 90 ? <BatteryFull className="size-3" /> :
         t.batteryPercent >= 50 ? <BatteryMedium className="size-3" /> :
         t.batteryPercent >= 20 ? <BatteryLow className="size-3" /> :
         <BatteryWarning className="size-3" />}
        {t.batteryPercent}%
      </span>
      <span className="text-border">|</span>
      <span className="flex items-center gap-1" title={`CPU: ${t.cpuUsagePercent}%`}>
        <Cpu className="size-3" />
        {t.cpuUsagePercent}%
      </span>
      <span className="text-border">|</span>
      <span className="flex items-center gap-1" title={`${runningCount}/${totalCount} services`}>
        <Signal className="size-3" />
        {runningCount}/{totalCount}
      </span>
    </div>
  );
}

function DataSourceBadge() {
  const t = useTelemetry();
  const demo = isAnyDemo([t.isDemo]);
  const tone = demo ? "warning" : "success";
  return (
    <Badge
      variant="outline"
      className={cn(
        "hidden gap-1.5 text-[10px] font-medium md:inline-flex",
        toneBg[tone],
        toneText[tone],
      )}
      title={demo ? "Running with demo data — set VITE_CONVEX_URL for live mode" : "Connected to live Convex backend"}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          demo ? "bg-amber-500" : "animate-pulse bg-emerald-500",
        )}
      />
      {demo ? "Demo" : "Live"}
    </Badge>
  );
}

export function DashboardHeader() {
  const { theme, toggleTheme } = useTheme();
  const { open: openCommandPanel } = useCommandPanel();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const now = useNow(1000);
  const isDark = theme === "dark";
  const current = TITLES[pathname] ?? "Dashboard";

  return (
    <header
      data-density-target="true"
      className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-6"
    >
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 hidden h-5 sm:block" />
      <Breadcrumb className="hidden sm:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/dashboard"
              onClick={(event) => {
                event.preventDefault();
                navigate("/dashboard");
              }}
              className="text-sm font-medium text-muted-foreground"
            >
              hermes
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-sm font-medium">
              {current}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <span className="text-sm font-medium sm:hidden">{current}</span>

      <div className="ml-auto flex items-center gap-1">
        <DataSourceBadge />

        <span className="hidden items-center gap-1.5 px-1 font-mono text-[11px] tabular-nums text-muted-foreground lg:flex">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          {formatClock(now)}
        </span>

        <QuickStatus />

        <Button
          variant="ghost"
          size="sm"
          onClick={openCommandPanel}
          className="h-8 gap-2 text-muted-foreground hover:text-foreground"
        >
          <Search className="size-3.5" />
          <span className="hidden lg:inline">Search or run command</span>
          <kbd className="hidden items-center gap-1 rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground lg:inline-flex">
            ⌘K
          </kbd>
        </Button>

        <Notifications />

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        <UserMenu />
      </div>
    </header>
  );
}