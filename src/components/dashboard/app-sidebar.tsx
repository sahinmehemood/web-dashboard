import {
  Bot,
  Brain,
  Crown,
  HeartPulse,
  History,
  LayoutDashboard,
  Settings,
  Terminal,
  Timer,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { NavLink, useLocation } from "react-router";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useBots, useCrons, useCrown, useProviders } from "@/hooks/use-dashboard";
import { cn } from "@/lib/utils";
import { toneText, type Tone } from "@/lib/status";
import logo from "@/assets/logo.svg";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  end?: boolean;
  badge?: string;
  badgeTone?: Tone;
}

function useNavBadges(): Record<string, { text: string; tone: Tone }> {
  const { data: crown } = useCrown();
  const { data: providers } = useProviders();
  const { data: bots } = useBots();
  const { data: crons } = useCrons();

  const up = crown.services.filter((s) => s.status === "run").length;
  const healthy = providers.filter((p) =>
    p.models.every((m) => m.status === "healthy"),
  ).length;
  const live = bots.filter((b) => b.status === "live").length;
  const enabled = crons.filter((c) => c.enabled).length;

  return {
    crown: {
      text: `${up}/${crown.services.length}`,
      tone: up === crown.services.length ? "success" : "warning",
    },
    providers: {
      text: `${healthy}/${providers.length}`,
      tone: healthy === providers.length ? "success" : "warning",
    },
    crons: {
      text: `${enabled}`,
      tone: enabled > 0 ? "success" : "neutral",
    },
    bots: {
      text: `${live}/${bots.length}`,
      tone: live === bots.length ? "success" : "danger",
    },
  };
}

const NAV_GROUPS: {
  label: string;
  items: (Omit<NavItem, "badge" | "badgeTone"> & { badgeKey?: string })[];
}[] = [
  {
    label: "Monitor",
    items: [
      { title: "Overview", href: "/dashboard", icon: LayoutDashboard, end: true },
      { title: "Crown", href: "/dashboard/crown", icon: Crown, badgeKey: "crown" },
      { title: "Providers", href: "/dashboard/providers", icon: Zap, badgeKey: "providers" },
      { title: "Crons", href: "/dashboard/crons", icon: Timer, badgeKey: "crons" },
      { title: "Activity", href: "/dashboard/activity", icon: History },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { title: "Brain", href: "/dashboard/brain", icon: Brain },
      { title: "Console", href: "/dashboard/console", icon: Terminal },
    ],
  },
  {
    label: "Channels",
    items: [{ title: "Bots", href: "/dashboard/bots", icon: Bot, badgeKey: "bots" }],
  },
  {
    label: "System",
    items: [
      { title: "Health", href: "/dashboard/health", icon: HeartPulse },
      { title: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

function NavItem({ item }: { item: NavItem }) {
  const { pathname } = useLocation();
  const active = item.end ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={item.title}
        className="group-data-[collapsible=icon]:justify-center"
      >
        <NavLink to={item.href} end={item.end}>
          <item.icon />
          <span>{item.title}</span>
        </NavLink>
      </SidebarMenuButton>
      {item.badge && (
        <SidebarMenuBadge
          className={cn(
            "bg-transparent font-normal",
            toneText[item.badgeTone ?? "neutral"],
          )}
        >
          {item.badge}
        </SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const badges = useNavBadges();

  const items = NAV_GROUPS.map((group) => ({
    label: group.label,
    items: group.items.map((item) => {
      const badge = item.badgeKey ? badges[item.badgeKey] : undefined;
      return {
        title: item.title,
        href: item.href,
        icon: item.icon,
        end: item.end,
        badge: badge?.text,
        badgeTone: badge?.tone,
      } satisfies NavItem;
    }),
  }));

  return (
    <>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <NavLink to="/" className="gap-2.5">
                <img
                  src={logo}
                  alt="Hermes"
                  width={28}
                  height={28}
                  className="rounded-md"
                />
                <span className="text-sm font-semibold tracking-tight">
                  hermes
                </span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {items.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <NavItem key={item.href} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="sm" className="text-muted-foreground">
              <NavLink to="/" className="gap-2">
                <span className="flex size-5 items-center justify-center rounded border border-border">
                  <img src={logo} alt="" width={14} height={14} className="rounded-sm" />
                </span>
                <span className="text-xs">Back to landing</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}