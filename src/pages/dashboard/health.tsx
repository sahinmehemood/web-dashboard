import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Boxes,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Cpu,
  Crown,
  FileText,
  MemoryStick,
  RefreshCw,
  ShieldAlert,
  Signal,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeDot, toneBg, toneForStatus, type Tone } from "@/lib/status";
import { CodeBlock } from "@/components/dashboard/code-block";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  useActivity,
  useCrons,
  useCrown,
  useProviders,
  useSendCommand,
  useTelemetry,
} from "@/hooks/use-dashboard";
import { DID } from "@/lib/demo";
import { formatMb, formatUptime, pctUsed, timeAgo } from "@/lib/formatters";
import { makeUptimeHistory, uptimePercent, type UptimeTone } from "@/lib/history";
import { cn } from "@/lib/utils";
import { useNow } from "@/hooks/use-settings";

type CheckStatus = "ok" | "warn" | "fail";

interface Check {
  id: string;
  label: string;
  status: CheckStatus;
  value: string;
  detail: string;
}

type IncidentState = "investigating" | "identified" | "monitoring" | "resolved";

interface Incident {
  id: string;
  title: string;
  state: IncidentState;
  component: string;
  startedAt: number;
  resolvedAt?: number;
  updates: { at: number; state: IncidentState; note: string }[];
}

const UPTIME_TONE_CLASS: Record<UptimeTone, string> = {
  operational: "bg-emerald-500",
  degraded: "bg-amber-500",
  outage: "bg-red-500",
};

const INCIDENT_STATE_META: Record<
  IncidentState,
  { label: string; tone: Tone }
> = {
  investigating: { label: "Investigating", tone: "danger" },
  identified: { label: "Identified", tone: "warning" },
  monitoring: { label: "Monitoring", tone: "info" },
  resolved: { label: "Resolved", tone: "success" },
};

export default function HealthPage() {
  const now = useNow(15000);
  const telemetry = useTelemetry().data;
  const crown = useCrown().data;
  const providers = useProviders().data;
  const crons = useCrons().data;
  const activity = useActivity(30).data;
  const send = useSendCommand();
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const handleRestartService = async (serviceName: string) => {
    try {
      await send({ deviceId: DID, commandType: "restart_hermes" });
      toast.success("Restart dispatched", {
        description: `Restart command sent for ${serviceName}.`,
      });
    } catch (error) {
      toast.error("Restart failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const uptimeSeries = useMemo(() => makeUptimeHistory(42, 90), []);
  const uptime = useMemo(() => uptimePercent(uptimeSeries), [uptimeSeries]);

  const checks: Check[] = useMemo(() => {
    const up = crown.services.filter((s) => s.status === "run").length;
    const healthy = providers.filter((p) =>
      p.models.every((m) => m.status === "healthy"),
    ).length;
    const memPct = pctUsed(telemetry.memUsedMb, telemetry.memTotalMb);
    const storPct = pctUsed(telemetry.storageUsedGb, telemetry.storageTotalGb);
    const recentErrors = activity.filter(
      (e) => e.level === "error" && now - e.timestamp < 86400000,
    ).length;

    return [
      {
        id: "device",
        label: "Device online",
        status: telemetry.networkOnline ? ("ok" as const) : ("fail" as const),
        value: telemetry.networkOnline ? "Online" : "Offline",
        detail: `${telemetry.hostname ?? "unknown"} · up ${formatUptime(telemetry.uptimeSeconds)}`,
      },
      {
        id: "crown",
        label: "Crown supervisor",
        status: crown.crownStatus === "GREEN" ? ("ok" as const) : ("fail" as const),
        value: `${up}/${crown.services.length} services`,
        detail: `${crown.runsvdirCount} runsvdir · ${crown.orphans} orphans`,
      },
      {
        id: "providers",
        label: "Model providers",
        status:
          healthy === providers.length ? ("ok" as const) : ("warn" as const),
        value: `${healthy}/${providers.length} healthy`,
        detail:
          providers
            .filter((p) => !p.models.every((m) => m.status === "healthy"))
            .map((p) => p.displayName)
            .join(", ") || "All providers nominal",
      },
      {
        id: "memory",
        label: "Memory pressure",
        status: memPct > 85 ? ("fail" as const) : memPct > 70 ? ("warn" as const) : ("ok" as const),
        value: `${Math.round(memPct)}% used`,
        detail: `${formatMb(telemetry.memUsedMb)} of ${formatMb(telemetry.memTotalMb)}`,
      },
      {
        id: "storage",
        label: "Storage capacity",
        status: storPct > 90 ? ("fail" as const) : storPct > 75 ? ("warn" as const) : ("ok" as const),
        value: `${Math.round(storPct)}% used`,
        detail: `${telemetry.storageUsedGb} of ${telemetry.storageTotalGb} GB`,
      },
      {
        id: "battery",
        label: "Battery",
        status: telemetry.batteryPercent < 15 ? ("fail" as const) : telemetry.batteryPercent < 30 ? ("warn" as const) : ("ok" as const),
        value: `${telemetry.batteryPercent}%`,
        detail: telemetry.batteryStatus,
      },
      {
        id: "crons",
        label: "Cron scheduler",
        status: crons.some((c) => c.enabled && c.lastStatus === "failed")
          ? ("warn" as const)
          : ("ok" as const),
        value: `${crons.filter((c) => c.enabled).length} enabled`,
        detail: `${crons.filter((c) => c.lastStatus === "ok").length} last run OK`,
      },
      {
        id: "errors",
        label: "Errors (24h)",
        status: recentErrors > 5 ? ("warn" as const) : recentErrors > 0 ? ("warn" as const) : ("ok" as const),
        value: `${recentErrors} error${recentErrors === 1 ? "" : "s"}`,
        detail: recentErrors === 0 ? "No recorded errors" : "Some events need review",
      },
    ];
  }, [telemetry, crown, providers, crons, activity, now]);

  const groupedChecks = useMemo(
    () => [
      {
        category: "Infrastructure",
        icon: Cpu,
        items: checks.filter((c) =>
          ["device", "memory", "storage", "battery"].includes(c.id),
        ),
      },
      {
        category: "Services",
        icon: Crown,
        items: checks.filter((c) => ["crown", "crons"].includes(c.id)),
      },
      {
        category: "Providers",
        icon: Zap,
        items: checks.filter((c) => c.id === "providers"),
      },
      {
        category: "Intelligence",
        icon: Brain,
        items: checks.filter((c) => c.id === "errors"),
      },
    ],
    [checks],
  );

  const statusTone: Tone =
    checks.some((c) => c.status === "fail")
      ? "danger"
      : checks.some((c) => c.status === "warn")
        ? "warning"
        : "success";
  const failCount = checks.filter((c) => c.status === "fail").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;

  const incidents: Incident[] = useMemo(() => {
    const recent = activity
      .filter((e) => e.level === "error" || e.level === "warning")
      .slice(0, 2)
      .map<Incident>((e) => ({
        id: `live-${e.timestamp}`,
        title: e.title,
        state: e.level === "error" ? "investigating" : "monitoring",
        component: e.activityType,
        startedAt: e.timestamp,
        updates: [
          {
            at: e.timestamp,
            state: e.level === "error" ? "investigating" : "monitoring",
            note: e.detail ?? "Auto-detected by health monitor.",
          },
        ],
      }));

    const historical: Incident[] = [
      {
        id: "inc-001",
        title: "NVIDIA provider rate limited",
        state: "resolved",
        component: "nvidia",
        startedAt: now - 1000 * 60 * 60 * 26,
        resolvedAt: now - 1000 * 60 * 60 * 25,
        updates: [
          { at: now - 1000 * 60 * 60 * 26, state: "investigating", note: "HTTP 429 from NVIDIA gateway." },
          { at: now - 1000 * 60 * 60 * 25.5, state: "identified", note: "Quota exhausted for free tier." },
          { at: now - 1000 * 60 * 60 * 25, state: "monitoring", note: "Failover to OpenRouter engaged." },
          { at: now - 1000 * 60 * 60 * 25, state: "resolved", note: "Traffic rerouted, metrics nominal." },
        ],
      },
      {
        id: "inc-002",
        title: "Tunnel service brief interruption",
        state: "resolved",
        component: "tunnel",
        startedAt: now - 1000 * 60 * 60 * 72,
        resolvedAt: now - 1000 * 60 * 60 * 71.5,
        updates: [
          { at: now - 1000 * 60 * 60 * 72, state: "investigating", note: "Serveo tunnel dropped." },
          { at: now - 1000 * 60 * 60 * 71.8, state: "identified", note: "Network handoff on carrier switch." },
          { at: now - 1000 * 60 * 60 * 71.5, state: "resolved", note: "Tunnel re-established by crown guard." },
        ],
      },
    ];

    return [...recent, ...historical].sort((a, b) => b.startedAt - a.startedAt);
  }, [activity, now]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Health"
        description="Derived system checks — uptime, resources, and service integrity."
      />

      {/* Overall status banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
      >
        <Card>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span
                className={cn(
                  "flex size-11 items-center justify-center rounded-xl",
                  toneBg[statusTone],
                )}
              >
                {statusTone === "success" ? (
                  <CheckCircle2 className="size-5" />
                ) : (
                  <ShieldAlert className="size-5" />
                )}
              </span>
              <div>
                <div className="flex items-center gap-2 text-base font-semibold tracking-tight">
                  {statusTone === "success"
                    ? "All systems operational"
                    : statusTone === "warning"
                      ? "Degraded performance"
                      : "System issues detected"}
                  <BadgeDot tone={statusTone} pulse />
                </div>
                <p className="text-xs text-muted-foreground">
                  {failCount} failing · {warnCount} warning ·{" "}
                  {checks.length - failCount - warnCount} passing
                </p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              Last evaluated {timeAgo(activity[0]?.timestamp)}
            </span>
          </CardContent>
        </Card>
      </motion.div>

      {/* 90-day uptime */}
      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Signal className="size-4 text-muted-foreground" />
              90-day uptime
            </div>
            <div className="mt-1 text-2xl font-bold tabular-nums tracking-tight">
              {uptime.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {uptimeSeries.filter((t) => t === "operational").length} operational ·{" "}
              {uptimeSeries.filter((t) => t === "degraded").length} degraded ·{" "}
              {uptimeSeries.filter((t) => t === "outage").length} outage
            </p>
          </div>
          <div className="flex-1 sm:max-w-md">
            <div className="flex h-8 items-stretch gap-[2px] overflow-hidden rounded-md">
              {uptimeSeries.map((tone, i) => (
                <span
                  key={i}
                  className={cn(
                    "flex-1 rounded-[2px]",
                    UPTIME_TONE_CLASS[tone],
                  )}
                  title={tone}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>90 days ago</span>
              <span>Today</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Component-level checks */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Boxes className="size-4 text-muted-foreground" />
              Component status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {groupedChecks.map((group) => (
              <div key={group.category}>
                <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <group.icon className="size-3" />
                  {group.category}
                </div>
                <div className="divide-y divide-border/60">
                  {group.items.map((check) => {
                    const tone: Tone =
                      check.status === "ok"
                        ? "success"
                        : check.status === "warn"
                          ? "warning"
                          : "danger";
                    return (
                      <div
                        key={check.id}
                        className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/40"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <BadgeDot tone={tone} pulse={check.status === "warn"} />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">
                              {check.label}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {check.detail}
                            </div>
                          </div>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 text-xs font-medium tabular-nums",
                            tone === "success"
                              ? "text-emerald-700 dark:text-emerald-400"
                              : tone === "warning"
                                ? "text-amber-700 dark:text-amber-400"
                                : "text-red-700 dark:text-red-400",
                          )}
                        >
                          {check.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="size-4 text-muted-foreground" />
              Recent alerts
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                {activity.filter((e) => e.level === "error" || e.level === "warning").length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activity.filter((e) => e.level === "error" || e.level === "warning").length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No warnings or errors recorded.
              </p>
            ) : (
              <ActivityFeed
                events={activity
                  .filter((e) => e.level === "error" || e.level === "warning")
                  .slice(0, 8)}
                className="max-h-[360px] overflow-y-auto"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Incident timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="size-4 text-muted-foreground" />
            Incident timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {incidents.map((inc) => {
            const meta = INCIDENT_STATE_META[inc.state];
            return (
              <div
                key={inc.id}
                className="rounded-lg border border-border p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <BadgeDot tone={meta.tone} pulse={inc.state !== "resolved"} />
                    <span className="truncate text-sm font-medium">
                      {inc.title}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                      toneBg[meta.tone],
                    )}
                  >
                    {meta.label}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{inc.component}</span>
                  <span>·</span>
                  <span>Started {timeAgo(inc.startedAt, now)}</span>
                  {inc.resolvedAt && (
                    <>
                      <span>·</span>
                      <span>Resolved {timeAgo(inc.resolvedAt, now)}</span>
                    </>
                  )}
                </div>
                <div className="mt-3 flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <span className="size-2 rounded-full bg-foreground" />
                    <span className="w-px flex-1 bg-border" />
                  </div>
                  <div className="flex-1 space-y-2 pb-1">
                    {inc.updates.map((u, i) => {
                      const um = INCIDENT_STATE_META[u.state];
                      return (
                        <div key={i} className="flex items-start gap-2">
                          <span
                            className={cn(
                              "mt-1.5 size-1.5 shrink-0 rounded-full",
                              u.state === "resolved"
                                ? "bg-emerald-500"
                                : u.state === "monitoring"
                                  ? "bg-blue-500"
                                  : u.state === "identified"
                                    ? "bg-amber-500"
                                    : "bg-red-500",
                            )}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-medium capitalize">{um.label}</span>
                              <span className="text-muted-foreground/70">
                                {timeAgo(u.at, now)}
                              </span>
                            </div>
                            <p className="truncate text-xs text-muted-foreground">
                              {u.note}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Service detail cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Crown className="size-4 text-muted-foreground" />
            Crown services
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {crown.services.filter((s) => s.status === "run").length}/{crown.services.length} running
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {crown.services.map((s) => {
            const tone = toneForStatus(s.status);
            const isExpanded = expandedService === s.name;
            return (
              <div key={s.name} className="rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setExpandedService(isExpanded ? null : s.name)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/40 cursor-pointer"
                >
                  <BadgeDot tone={tone} pulse={s.status === "run"} />
                  <span className="font-mono text-sm font-medium">{s.name}</span>
                  {s.pid && (
                    <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
                      PID {s.pid}
                    </span>
                  )}
                  {s.uptime && (
                    <span className="hidden text-xs text-muted-foreground md:inline">
                      {s.uptime}
                    </span>
                  )}
                  {s.memoryMb != null && (
                    <span className="hidden items-center gap-1 text-xs text-muted-foreground lg:inline">
                      <MemoryStick className="size-3" />
                      {s.memoryMb}MB
                    </span>
                  )}
                  {s.cpuPercent != null && (
                    <span className="hidden items-center gap-1 text-xs text-muted-foreground lg:inline">
                      <Cpu className="size-3" />
                      {s.cpuPercent.toFixed(1)}%
                    </span>
                  )}
                  {s.restartCount != null && s.restartCount > 0 && (
                    <span className="hidden items-center gap-1 text-xs text-amber-600 dark:text-amber-400 lg:inline">
                      <RefreshCw className="size-3" />
                      {s.restartCount}
                    </span>
                  )}
                  <span
                    className={cn(
                      "ml-auto inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                      toneBg[tone],
                    )}
                  >
                    {s.status}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="size-4 text-muted-foreground" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-3 py-3 space-y-3">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <div className="rounded-lg bg-secondary/60 px-2.5 py-1.5">
                        <div className="text-[10px] text-muted-foreground">PID</div>
                        <div className="text-sm font-bold tabular-nums font-mono">{s.pid ?? "—"}</div>
                      </div>
                      <div className="rounded-lg bg-secondary/60 px-2.5 py-1.5">
                        <div className="text-[10px] text-muted-foreground">Uptime</div>
                        <div className="text-sm font-bold tabular-nums">{s.uptime ?? "—"}</div>
                      </div>
                      <div className="rounded-lg bg-secondary/60 px-2.5 py-1.5">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <MemoryStick className="size-2.5" /> Memory
                        </div>
                        <div className="text-sm font-bold tabular-nums">{s.memoryMb != null ? `${s.memoryMb}MB` : "—"}</div>
                      </div>
                      <div className="rounded-lg bg-secondary/60 px-2.5 py-1.5">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Cpu className="size-2.5" /> CPU
                        </div>
                        <div className="text-sm font-bold tabular-nums">{s.cpuPercent != null ? `${s.cpuPercent.toFixed(1)}%` : "—"}</div>
                      </div>
                    </div>

                    {s.restartCount != null && s.restartCount > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                        <RefreshCw className="size-3" />
                        {s.restartCount} restart{s.restartCount !== 1 ? "s" : ""} since boot
                      </div>
                    )}

                    {s.logTail && s.logTail.length > 0 && (
                      <div>
                        <div className="mb-1 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                          <FileText className="size-3" />
                          Recent logs
                        </div>
                        <CodeBlock text={s.logTail.join("\n")} />
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestartService(s.name)}
                      >
                        <RefreshCw className="size-3.5" />
                        Restart service
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
