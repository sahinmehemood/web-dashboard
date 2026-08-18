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
  CheckCircle2,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const NAV_COMMANDS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Crown", href: "/dashboard/crown", icon: Crown },
  { label: "Providers", href: "/dashboard/providers", icon: Zap },
  { label: "Crons", href: "/dashboard/crons", icon: Timer },
  { label: "Activity", href: "/dashboard/activity", icon: History },
  { label: "Brain", href: "/dashboard/brain", icon: Brain },
  { label: "Console", href: "/dashboard/console", icon: Terminal },
  { label: "Bots", href: "/dashboard/bots", icon: Bot },
  { label: "Health", href: "/dashboard/health", icon: HeartPulse },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const QUICK_COMMANDS: { type: string; label: string; icon: LucideIcon }[] = [
  { type: "crown_status", label: "Crown status", icon: Crown },
  { type: "restart_hermes", label: "Restart Hermes", icon: RefreshCw },
  { type: "check_providers", label: "Check models", icon: Zap },
  { type: "run_health", label: "Run StackGov", icon: Shield },
  { type: "git_sync", label: "Git sync", icon: GitBranch },
  { type: "list_crons", label: "List crons", icon: Calendar },
];

const COMMAND_TYPES = [
  { value: "custom", label: "Shell command" },
  { value: "crown_status", label: "Crown status" },
  { value: "restart_hermes", label: "Restart Hermes" },
  { value: "run_skill", label: "Run skill" },
  { value: "send_message", label: "Send Telegram" },
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
      if (event.key === "Escape") setOpen(false);
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
  const [commandType, setCommandType] = useState("custom");
  const [payload, setPayload] = useState("");
  const [sending, setSending] = useState<string | null>(null);

  const dispatch = useCallback(
    async (type: string, commandPayload?: string) => {
      setSending(type + ":" + (commandPayload ?? ""));
      try {
        await send({
          deviceId: DID,
          commandType: type,
          payload: commandPayload || undefined,
        });
        toast.success("Command sent", {
          description: `${type.replace(/_/g, " ")} dispatched to device.`,
        });
        onOpenChange(false);
        setPayload("");
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

  const handleQuick = useCallback((type: string) => dispatch(type), [dispatch]);

  const handleCustom = useCallback(() => {
    if (!payload.trim()) {
      toast.warning("Command payload required", {
        description: "Enter a shell command before sending.",
      });
      return;
    }
    dispatch("custom", payload);
  }, [dispatch, payload]);

  const go = useCallback(
    (href: string) => {
      navigate(href);
      onOpenChange(false);
    },
    [navigate, onOpenChange],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-4 pr-12">
          <SheetTitle className="flex items-center gap-2 text-sm">
            <Terminal className="size-4" />
            Command center
          </SheetTitle>
          <SheetDescription>
            Jump anywhere, run a command, or toggle appearance.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <section>
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Navigate
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {NAV_COMMANDS.map(({ label, href, icon: Icon }) => (
                <Button
                  key={href}
                  variant="outline"
                  size="sm"
                  onClick={() => go(href)}
                  className="h-10 justify-start gap-2 text-xs font-normal"
                >
                  <Icon className="size-3.5 text-muted-foreground" />
                  {label}
                </Button>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toggleTheme();
                  onOpenChange(false);
                }}
                className="h-10 justify-start gap-2 text-xs font-normal"
              >
                {theme === "dark" ? (
                  <Sun className="size-3.5 text-muted-foreground" />
                ) : (
                  <Moon className="size-3.5 text-muted-foreground" />
                )}
                Switch to {theme === "dark" ? "light" : "dark"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => go("/dashboard/settings")}
                className="h-10 justify-start gap-2 text-xs font-normal"
              >
                <Settings className="size-3.5 text-muted-foreground" />
                Appearance settings
              </Button>
            </div>
          </section>

          <Separator />

          <section>
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Quick commands
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_COMMANDS.map(({ type, label, icon: Icon }) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuick(type)}
                  disabled={sending !== null}
                  className="h-12 justify-start gap-2 text-xs font-normal"
                >
                  <Icon className="size-3.5 text-muted-foreground" />
                  {label}
                </Button>
              ))}
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Custom command
            </h4>
            <Select value={commandType} onValueChange={setCommandType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Command type" />
              </SelectTrigger>
              <SelectContent>
                {COMMAND_TYPES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {commandType === "custom" && (
              <Input
                value={payload}
                onChange={(event) => setPayload(event.target.value)}
                placeholder="bash crown.sh"
                className="font-mono"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleCustom();
                  }
                }}
              />
            )}
            <Button
              onClick={handleCustom}
              disabled={sending !== null}
              className="w-full"
            >
              {sending?.startsWith("custom") ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Send command
            </Button>
          </section>
        </div>

        <div className="border-t px-5 py-3">
          <p className="text-center text-[11px] text-muted-foreground/70">
            Press <kbd className="font-mono text-foreground/80">⌘K</kbd> to open
            anywhere · <kbd className="font-mono text-foreground/80">Esc</kbd>{" "}
            to close
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}