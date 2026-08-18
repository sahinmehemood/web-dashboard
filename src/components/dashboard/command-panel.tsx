import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  Bot,
  Brain,
  Calendar,
  Crown,
  GitBranch,
  HeartPulse,
  History,
  LayoutDashboard,
  Loader2,
  Moon,
  RefreshCw,
  Settings,
  Shield,
  Sun,
  Terminal,
  Timer,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useSendCommand } from "@/hooks/use-dashboard";
import { useTheme } from "@/components/theme-provider";
import { DID } from "@/lib/demo";

interface CommandPanelContextValue {
  open: () => void;
}

const CommandPanelContext = createContext<CommandPanelContextValue>({
  open: () => {},
});

export function useCommandPanel() {
  return useContext(CommandPanelContext);
}

const NAV_ITEMS: { label: string; href: string; icon: LucideIcon; shortcut: string }[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, shortcut: "1" },
  { label: "Crown", href: "/dashboard/crown", icon: Crown, shortcut: "2" },
  { label: "Providers", href: "/dashboard/providers", icon: Zap, shortcut: "3" },
  { label: "Crons", href: "/dashboard/crons", icon: Timer, shortcut: "4" },
  { label: "Activity", href: "/dashboard/activity", icon: History, shortcut: "5" },
  { label: "Brain", href: "/dashboard/brain", icon: Brain, shortcut: "6" },
  { label: "Console", href: "/dashboard/console", icon: Terminal, shortcut: "7" },
  { label: "Bots", href: "/dashboard/bots", icon: Bot, shortcut: "8" },
  { label: "Health", href: "/dashboard/health", icon: HeartPulse, shortcut: "9" },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, shortcut: "0" },
];

const QUICK_ACTIONS: { type: string; label: string; icon: LucideIcon; shortcut: string }[] = [
  { type: "crown_status", label: "Crown status", icon: Crown, shortcut: "⌘1" },
  { type: "restart_hermes", label: "Restart Hermes", icon: RefreshCw, shortcut: "⌘2" },
  { type: "check_providers", label: "Check models", icon: Zap, shortcut: "⌘3" },
  { type: "run_health", label: "Run StackGov", icon: Shield, shortcut: "⌘4" },
  { type: "git_sync", label: "Git sync", icon: GitBranch, shortcut: "⌘5" },
  { type: "list_crons", label: "List crons", icon: Calendar, shortcut: "⌘6" },
];

export function CommandPanelProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openPanel = useCallback(() => setOpen(true), []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const value = useMemo(() => ({ open: openPanel }), [openPanel]);

  return (
    <CommandPanelContext.Provider value={value}>
      {children}
      <CommandPanel open={open} onOpenChange={setOpen} />
    </CommandPanelContext.Provider>
  );
}

function CommandPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const send = useSendCommand();
  const navigate = useNavigate();
  const { toggleTheme, theme } = useTheme();
  const [sending, setSending] = useState<string | null>(null);

  const dispatch = useCallback(
    async (type: string) => {
      setSending(type);
      try {
        await send({
          deviceId: DID,
          commandType: type,
        });
        toast.success("Command sent", {
          description: `${type.replace(/_/g, " ")} dispatched to device.`,
        });
        onOpenChange(false);
      } catch (error) {
        toast.error("Failed to send command", {
          description:
            error instanceof Error
              ? error.message
              : "Unknown error while dispatching command.",
        });
      } finally {
        setSending(null);
      }
    },
    [onOpenChange, send],
  );

  const go = useCallback(
    (href: string) => {
      navigate(href);
      onOpenChange(false);
    },
    [navigate, onOpenChange],
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Command center" description="Search, navigate, or run commands">
      <CommandInput placeholder="Search commands, pages, or actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigate">
          {NAV_ITEMS.map(({ label, href, icon: Icon, shortcut }) => (
            <CommandItem key={href} onSelect={() => go(href)}>
              <Icon className="size-4 text-muted-foreground" />
              <span>{label}</span>
              <CommandShortcut>{shortcut}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick commands">
          {QUICK_ACTIONS.map(({ type, label, icon: Icon, shortcut }) => (
            <CommandItem
              key={type}
              onSelect={() => dispatch(type)}
              disabled={sending !== null}
            >
              {sending === type ? (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              ) : (
                <Icon className="size-4 text-muted-foreground" />
              )}
              <span>{label}</span>
              <CommandShortcut>{shortcut}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Appearance">
          <CommandItem onSelect={() => { toggleTheme(); onOpenChange(false); }}>
            {theme === "dark" ? <Sun className="size-4 text-muted-foreground" /> : <Moon className="size-4 text-muted-foreground" />}
            <span>Switch to {theme === "dark" ? "light" : "dark"}</span>
            <CommandShortcut>⌘T</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/dashboard/settings")}>
            <Settings className="size-4 text-muted-foreground" />
            <span>Appearance settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
