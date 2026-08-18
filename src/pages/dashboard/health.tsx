import { useMemo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Crown, HeartPulse, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeDot, toneBg, toneForStatus, type Tone } from "@/lib/status";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  useActivity,
  useCrons,
  useCrown,
  useProviders,
  useTelemetry,
} from "@/hooks/use-dashboard";
import { formatMb, formatUptime, pctUsed, timeAgo } from "@/lib/formatters";
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

export default function HealthPage() {
  const now = useNow(15000);
  const telemetry = useTelemetry().data;
  const crown = useCrown().data;
  const providers = useProviders().data;
  const crons = useCrons().data;
  const activity = useActivity(30).data;

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

  const statusTone: Tone =
    checks.some((c) => c.status === "fail")
      ? "danger"
      : checks.some((c) => c.status === "warn")
        ? "warning"
        : "success";
  const failCount = checks.filter((c) => c.status === "fail").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;

  const incidents = activity.filter((e) => e.level === "error" || e.level === "warning");

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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Checks */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <HeartPulse className="size-4 text-muted-foreground" />
              System checks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {checks.map((check) => {
              const tone: Tone =
                check.status === "ok" ? "success" : check.status === "warn" ? "warning" : "danger";
              return (
                <div
                  key={check.id}
                  className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/40"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <BadgeDot tone={tone} pulse={check.status === "warn"} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{check.label}</div>
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
          </CardContent>
        </Card>

        {/* Incidents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="size-4 text-muted-foreground" />
              Recent alerts
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                {incidents.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {incidents.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No warnings or errors recorded.
              </p>
            ) : (
              <ActivityFeed
                events={incidents.slice(0, 8)}
                className="max-h-[360px] overflow-y-auto"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Service status table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Crown className="size-4 text-muted-foreground" />
            Crown service status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Service</th>
                  <th className="hidden px-4 py-2.5 font-medium sm:table-cell">PID</th>
                  <th className="hidden px-4 py-2.5 font-medium md:table-cell">Uptime</th>
                  <th className="px-4 py-2.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {crown.services.map((s) => {
                  const tone = toneForStatus(s.status);
                  return (
                    <tr key={s.name} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <BadgeDot tone={tone} pulse={s.status === "run"} />
                          <span className="font-mono text-xs font-medium">{s.name}</span>
                        </div>
                      </td>
                      <td className="hidden px-4 py-2.5 font-mono text-xs text-muted-foreground sm:table-cell">
                        {s.pid ?? "—"}
                      </td>
                      <td className="hidden px-4 py-2.5 text-xs text-muted-foreground md:table-cell">
                        {s.uptime ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                            toneBg[tone],
                          )}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}