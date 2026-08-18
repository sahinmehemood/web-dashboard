import { motion } from "framer-motion";
import {
  Activity,
  Battery,
  Bot,
  Boxes,
  Clock,
  Cpu,
  Crown,
  HardDrive,
  HeartPulse,
  Smartphone,
  Sparkles,
  Terminal,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeDot, toneBg, toneForStatus, type Tone } from "@/lib/status";
import { Badge as UIBadge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/dashboard/code-block";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { MetricChart } from "@/components/dashboard/metric-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { useCommandPanel } from "@/components/dashboard/command-panel";
import {
  useActivity,
  useBots,
  useCrown,
  useProviders,
  useSendCommand,
  useTelemetry,
} from "@/hooks/use-dashboard";
import { DID, DDEV } from "@/lib/demo";
import { makeHistory } from "@/lib/history";
import { formatGb, formatMb, formatUptime, pctUsed } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export default function OverviewPage() {
  const navigate = useNavigate();
  const { open: openCommandPanel } = useCommandPanel();
  const send = useSendCommand();
  const telemetry = useTelemetry().data;
  const crown = useCrown().data;
  const providers = useProviders().data;
  const bots = useBots().data;
  const activity = useActivity(8).data;

  const memPct = pctUsed(telemetry.memUsedMb, telemetry.memTotalMb);
  const storPct = pctUsed(telemetry.storageUsedGb, telemetry.storageTotalGb);
  const upSvc = crown.services.filter((s) => s.status === "run").length;
  const healthyProviders = providers.filter((p) =>
    p.models.every((m) => m.status === "healthy"),
  ).length;
  const healthScore = Math.round(
    (upSvc / crown.services.length) * 40 +
      (healthyProviders / Math.max(1, providers.length)) * 30 +
      (telemetry.networkOnline ? 15 : 0) +
      (telemetry.batteryPercent > 20 ? 15 : 0),
  );
  const healthTone: Tone =
    healthScore >= 80 ? "success" : healthScore >= 50 ? "warning" : "danger";

  const chips = [
    {
      label: "Crown",
      value: `${upSvc}/${crown.services.length}`,
      tone: upSvc === crown.services.length ? "success" : "warning",
    },
    {
      label: "Providers",
      value: `${healthyProviders}/${providers.length}`,
      tone: healthyProviders === providers.length ? "success" : "warning",
    },
    {
      label: "Network",
      value: telemetry.networkOnline ? "Online" : "Offline",
      tone: telemetry.networkOnline ? "success" : "danger",
    },
    {
      label: "Battery",
      value: `${telemetry.batteryPercent}%`,
      tone: telemetry.batteryPercent > 20 ? "success" : "danger",
    },
    {
      label: "Device",
      value: telemetry.hostname ?? "Unknown",
      tone: "neutral",
    },
  ];

  const checkCrown = async () => {
    try {
      await send({ deviceId: DID, commandType: "crown_status" });
      toast.success("Checking crown", {
        description: "crown_status dispatched to device.",
      });
    } catch (error) {
      toast.error("Failed to check crown", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="Real-time health of your Hermes device, services, and model providers."
      >
        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/console")}>
          <Terminal className="size-3.5" />
          Console
        </Button>
        <Button variant="outline" size="sm" onClick={openCommandPanel}>
          <Sparkles className="size-3.5" />
          Run command
        </Button>
        <Button size="sm" onClick={checkCrown}>
          <Crown className="size-3.5" />
          Check crown
        </Button>
      </PageHeader>

      {/* Device banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
      >
        <Card>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-muted-foreground">
                <Smartphone className="size-5" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-base font-semibold tracking-tight">
                    {telemetry.hostname ?? "hermes"}
                  </span>
                  <UIBadge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                    {DDEV.model}
                  </UIBadge>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span className="font-mono">{DID}</span>
                  <span>{DDEV.os} · {DDEV.arch}</span>
                  <span>up {formatUptime(telemetry.uptimeSeconds)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                  toneBg[healthTone],
                )}
              >
                <BadgeDot tone={healthTone} pulse />
                {healthScore >= 80
                  ? "All systems operational"
                  : healthScore >= 50
                    ? "Degraded performance"
                    : "Critical"}
              </span>
              <span className="text-2xl font-bold tracking-tight tabular-nums">
                {healthScore}
                <span className="text-xs font-normal text-muted-foreground">/100</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Health chips */}
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip.label}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              toneBg[chip.tone as Tone],
            )}
          >
            <BadgeDot tone={chip.tone as Tone} />
            {chip.label}: {chip.value}
          </span>
        ))}
      </div>

      {/* Metric cards with sparklines */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          icon={Battery}
          label="Battery"
          value={`${telemetry.batteryPercent}%`}
          sub={telemetry.batteryStatus}
          tone="success"
          progress={telemetry.batteryPercent}
          chart={<MetricChart data={makeHistory(7, 24, telemetry.batteryPercent, 3)} tone="success" />}
        />
        <StatCard
          icon={Cpu}
          label="CPU"
          value={`${telemetry.cpuUsagePercent}%`}
          sub={`${telemetry.cpuCores} cores · load ${telemetry.loadAvg1}`}
          tone="info"
          progress={telemetry.cpuUsagePercent}
          chart={<MetricChart data={makeHistory(3, 24, telemetry.cpuUsagePercent, 6)} tone="info" />}
        />
        <StatCard
          icon={Activity}
          label="Memory"
          value={`${Math.round(memPct)}%`}
          sub={`${formatMb(telemetry.memUsedMb)} / ${formatMb(telemetry.memTotalMb)}`}
          tone="info"
          progress={memPct}
          chart={<MetricChart data={makeHistory(11, 24, memPct, 4)} tone="info" />}
        />
        <StatCard
          icon={HardDrive}
          label="Storage"
          value={`${Math.round(storPct)}%`}
          sub={`${formatGb(telemetry.storageUsedGb)} / ${formatGb(telemetry.storageTotalGb)}`}
          tone="warning"
          progress={storPct}
          chart={<MetricChart data={makeHistory(17, 24, storPct, 1.5)} tone="warning" />}
        />
        <StatCard
          icon={Clock}
          label="Uptime"
          value={formatUptime(telemetry.uptimeSeconds)}
          sub="Since last boot"
          tone="neutral"
        />
        <StatCard
          icon={telemetry.networkOnline ? Wifi : WifiOff}
          label="Network"
          value={telemetry.networkOnline ? "Online" : "Offline"}
          sub={telemetry.hostname ?? "Unknown"}
          tone={telemetry.networkOnline ? "success" : "danger"}
        />
      </div>

      {/* Summary columns */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Crown className="size-4 text-muted-foreground" />
              Crown services
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                {upSvc}/{crown.services.length} up
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {crown.services.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <BadgeDot tone={toneForStatus(s.status)} pulse={s.status === "run"} />
                  <span className="font-mono text-xs">{s.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {s.uptime ?? "—"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Activity className="size-4 text-muted-foreground" />
              Recent activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed
              events={activity.slice(0, 8)}
              className="max-h-[320px] overflow-y-auto"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Boxes className="size-4 text-muted-foreground" />
              Provider summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {providers.slice(0, 6).map((p) => {
              const healthy = p.models.every((m) => m.status === "healthy");
              return (
                <div
                  key={p.name}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {p.displayName}
                    </div>
                    <div className="truncate font-mono text-[11px] text-muted-foreground">
                      {p.models.length} model{p.models.length > 1 ? "s" : ""}
                      {p.baseUrl ? ` · ${p.baseUrl}` : ""}
                    </div>
                  </div>
                  <BadgeDot
                    tone={healthy ? "success" : "warning"}
                    pulse={healthy}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions + bots */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Zap className="size-4 text-muted-foreground" />
              Quick actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Button
              variant="outline"
              size="sm"
              className="h-11 justify-start gap-2 text-xs font-normal"
              onClick={() => navigate("/dashboard/console")}
            >
              <Terminal className="size-3.5 text-muted-foreground" />
              Open console
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-11 justify-start gap-2 text-xs font-normal"
              onClick={() => navigate("/dashboard/health")}
            >
              <HeartPulse className="size-3.5 text-muted-foreground" />
              View health
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-11 justify-start gap-2 text-xs font-normal"
              onClick={() => navigate("/dashboard/providers")}
            >
              <Zap className="size-3.5 text-muted-foreground" />
              Providers
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-11 justify-start gap-2 text-xs font-normal"
              onClick={checkCrown}
            >
              <Crown className="size-3.5 text-muted-foreground" />
              Check crown
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-11 justify-start gap-2 text-xs font-normal"
              onClick={() => navigate("/dashboard/bots")}
            >
              <Bot className="size-3.5 text-muted-foreground" />
              Bots
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-11 justify-start gap-2 text-xs font-normal"
              onClick={openCommandPanel}
            >
              <Sparkles className="size-3.5 text-muted-foreground" />
              Command center
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Bot className="size-4 text-muted-foreground" />
              Telegram bots
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {bots.map((b) => (
              <div
                key={b.botId}
                className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">@{b.username}</div>
                  <div className="truncate text-xs capitalize text-muted-foreground">
                    {b.role.replace(/_/g, " ")}
                    {b.apiPort ? ` · :${b.apiPort}` : ""}
                  </div>
                </div>
                <BadgeDot tone={toneForStatus(b.status)} pulse={b.status === "live"} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Crown reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Crown architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock text={CROWN_REFERENCE} />
        </CardContent>
      </Card>
    </div>
  );
}

const CROWN_REFERENCE = [
  "runsvdir -P $PREFIX/var/service/",
  "├── bot       → hermes gateway run --replace  (8642)",
  "├── bot2      → hermes gateway run             (8643)",
  "├── web       → hermes dashboard --port 9119",
  "├── search    → SearXNG (waitress)             (8888)",
  "├── tunnel    → serveo_tunnel.py               (nobilem)",
  "├── proxy     → dashboard_proxy.py             (9120→9119)",
  "└── scraper   → scraper_service.py             (8777)",
  "",
  "Boot: ~/.termux/boot/start-crown.sh",
  "Guard: ~/.bashrc auto-restore on app reopen",
].join("\n");