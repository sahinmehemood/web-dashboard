import { Database, Info, Keyboard, MonitorCog, Palette } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/dashboard/page-header";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import {
  useBrain,
  useBots,
  useCrons,
  useCrown,
  useProviders,
  useTelemetry,
} from "@/hooks/use-dashboard";
import { useSettings, type Density } from "@/hooks/use-settings";
import { APP_VERSION, DDEV } from "@/lib/demo";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";

const REFRESH_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 15, label: "Every 15 seconds" },
  { value: 30, label: "Every 30 seconds" },
  { value: 60, label: "Every minute" },
  { value: 300, label: "Every 5 minutes" },
];

const KEYBOARD_ROWS = [
  { label: "Open command center", shortcut: "⌘K" },
  { label: "Close command center", shortcut: "Esc" },
  { label: "Toggle theme", shortcut: "via command center" },
];

function SourceBadge({ demo }: { demo: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        demo
          ? "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400"
          : "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
      )}
    >
      {demo ? "Demo" : "Live"}
    </Badge>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const {
    density,
    refreshSeconds,
    autoRefresh,
    setDensity,
    setRefreshSeconds,
    setAutoRefresh,
  } = useSettings();
  const { user } = useAuth();
  const telemetry = useTelemetry();
  const crown = useCrown();
  const providers = useProviders();
  const crons = useCrons();
  const brain = useBrain();
  const bots = useBots();

  const email = user?.email;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Appearance, data source, and system information."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Palette className="size-4 text-muted-foreground" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Theme
            </span>
            <RadioGroup
              value={theme}
              onValueChange={(value) => setTheme(value as "light" | "dark")}
              className="flex flex-wrap gap-x-6 gap-y-3"
            >
              {(["light", "dark"] as const).map((option) => (
                <div key={option} className="flex items-start gap-2">
                  <RadioGroupItem
                    value={option}
                    id={`theme-${option}`}
                    className="mt-0.5"
                  />
                  <Label htmlFor={`theme-${option}`} className="capitalize">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Density
            </span>
            <RadioGroup
              value={density}
              onValueChange={(value) => setDensity(value as Density)}
              className="gap-4"
            >
              <div className="flex items-start gap-2">
                <RadioGroupItem
                  value="default"
                  id="density-default"
                  className="mt-0.5"
                />
                <div className="grid gap-0.5">
                  <Label htmlFor="density-default">Default</Label>
                  <span className="text-xs text-muted-foreground">
                    Spacious — relaxed spacing
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <RadioGroupItem
                  value="compact"
                  id="density-compact"
                  className="mt-0.5"
                />
                <div className="grid gap-0.5">
                  <Label htmlFor="density-compact">Compact</Label>
                  <span className="text-xs text-muted-foreground">
                    Dense — tighter tables
                  </span>
                </div>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <MonitorCog className="size-4 text-muted-foreground" />
            Data refresh
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="grid gap-1">
              <Label htmlFor="auto-refresh">Auto-refresh telemetry</Label>
              <span className="text-xs text-muted-foreground">
                Changes apply to live telemetry polling.
              </span>
            </div>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="grid gap-1">
              <Label>Refresh interval</Label>
              <span className="text-xs text-muted-foreground">
                How often telemetry is polled while live.
              </span>
            </div>
            <Select
              value={String(refreshSeconds)}
              onValueChange={(value) => setRefreshSeconds(Number(value))}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REFRESH_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Database className="size-4 text-muted-foreground" />
            Data source
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { name: "Device telemetry", demo: telemetry.isDemo },
            { name: "Crown services", demo: crown.isDemo },
            { name: "Providers", demo: providers.isDemo },
            { name: "Crons", demo: crons.isDemo },
            { name: "Brain", demo: brain.isDemo },
            { name: "Bots", demo: bots.isDemo },
          ].map((row) => (
            <div
              key={row.name}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5"
            >
              <span className="text-sm">{row.name}</span>
              <SourceBadge demo={row.demo} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Keyboard className="size-4 text-muted-foreground" />
            Keyboard shortcuts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            {KEYBOARD_ROWS.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4"
              >
                <dt className="text-sm">{row.label}</dt>
                <dd>
                  <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {row.shortcut}
                  </kbd>
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Info className="size-4 text-muted-foreground" />
            About
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <span className="text-sm">App version</span>
            <Badge variant="outline" className="font-mono">
              {APP_VERSION}
            </Badge>
          </div>

          {email && (
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <span className="text-sm">Signed in as</span>
              <span className="text-sm text-muted-foreground">{email}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            {[
              { label: "Hostname", value: DDEV.hostname },
              { label: "Model", value: DDEV.model },
              { label: "OS", value: DDEV.os },
              { label: "Android version", value: DDEV.androidVersion },
              { label: "Architecture", value: DDEV.arch },
              { label: "Kernel", value: DDEV.kernel },
              { label: "Termux version", value: DDEV.termuxVersion },
              { label: "Installed", value: formatDate(DDEV.installedAt) },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </div>
                <div className="mt-1 truncate text-sm font-medium">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}