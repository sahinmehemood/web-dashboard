import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Bot,
  Cpu,
  MemoryStick,
  RefreshCw,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeDot, toneBg, type Tone } from "@/lib/status";
import { MetricChart } from "@/components/dashboard/metric-chart";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { useAgents, useSendCommand } from "@/hooks/use-dashboard";
import { useNow } from "@/hooks/use-settings";
import { DID } from "@/lib/demo";
import { makeHistory } from "@/lib/history";
import { formatUptime, timeAgo } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { AgentInstance } from "@/lib/demo";

const STATE_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "idle", label: "Idle" },
  { value: "crashed", label: "Crashed" },
];

function AgentCard({
  agent,
  now,
  onRestart,
}: {
  agent: AgentInstance;
  now: number;
  onRestart: (agentId: string) => void;
}) {
  const hist = useMemo(
    () => makeHistory(agent.messagesHandled % 20, 24, agent.cpuPercent, 1.5),
    [agent.messagesHandled, agent.cpuPercent],
  );
  const stateTone: Tone =
    agent.state === "active"
      ? "success"
      : agent.state === "idle"
        ? "warning"
        : "danger";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
    >
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg",
                  toneBg[stateTone],
                )}
              >
                <Bot className="size-4" />
              </span>
              <div>
                <CardTitle className="text-sm font-semibold">
                  {agent.name}
                </CardTitle>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Bot className="size-3" />
                  @{agent.connectedBot}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={agent.state} />
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => onRestart(agent.agentId)}
                title={`Restart ${agent.name}`}
              >
                <RefreshCw className="size-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-secondary/60 px-2.5 py-1.5">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Activity className="size-2.5" />
                Messages
              </div>
              <div className="text-sm font-bold tabular-nums">
                {agent.messagesHandled.toLocaleString()}
              </div>
            </div>
            <div className="rounded-lg bg-secondary/60 px-2.5 py-1.5">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Cpu className="size-2.5" />
                CPU
              </div>
              <div className="text-sm font-bold tabular-nums">
                {agent.cpuPercent.toFixed(1)}%
              </div>
            </div>
            <div className="rounded-lg bg-secondary/60 px-2.5 py-1.5">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <MemoryStick className="size-2.5" />
                RAM
              </div>
              <div className="text-sm font-bold tabular-nums">
                {agent.memoryMb}MB
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Uptime: {formatUptime(agent.uptimeSeconds)}</span>
            <span>Last active: {timeAgo(agent.lastActiveAt, now)}</span>
          </div>

          {agent.servicePid && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono">PID {agent.servicePid}</span>
              {agent.state === "crashed" && (
                <span className="text-red-500 font-medium">· Process exited</span>
              )}
            </div>
          )}

          <div className="h-8 overflow-hidden rounded-md bg-secondary/40">
            <MetricChart data={hist} tone={stateTone} height={32} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AgentsPage() {
  const { data: agents } = useAgents();
  const send = useSendCommand();
  const [stateFilter, setStateFilter] = useState("all");
  const now = useNow(15000);

  const filtered = useMemo(() => {
    if (stateFilter === "all") return agents;
    return agents.filter((a) => a.state === stateFilter);
  }, [agents, stateFilter]);

  const active = agents.filter((a) => a.state === "active").length;
  const idle = agents.filter((a) => a.state === "idle").length;
  const crashed = agents.filter((a) => a.state === "crashed").length;
  const totalMessages = agents.reduce((s, a) => s + a.messagesHandled, 0);

  const handleRestart = async (agentId: string) => {
    try {
      await send({ deviceId: DID, commandType: "restart_hermes" });
      toast.success("Restart dispatched", {
        description: `Restart command sent for ${agentId}.`,
      });
    } catch (error) {
      toast.error("Restart failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Agents"
        description="Hermes agent instances — state, bot connection, resource usage, and activity."
      />

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Total", value: String(agents.length), tone: "neutral" as const },
          { label: "Active", value: String(active), tone: "success" as const },
          { label: "Idle", value: String(idle), tone: "warning" as const },
          { label: "Crashed", value: String(crashed), tone: "danger" as const },
          {
            label: "Messages",
            value: totalMessages.toLocaleString(),
            tone: "info" as const,
          },
        ].map((item) => (
          <span
            key={item.label}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs"
          >
            <BadgeDot tone={item.tone} pulse={item.tone === "success"} />
            <span className="font-medium text-foreground">{item.value}</span>
            <span className="text-muted-foreground">{item.label}</span>
          </span>
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {STATE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStateFilter(f.value)} aria-pressed={stateFilter === f.value}
            className={cn(
              "cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
              stateFilter === f.value
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Agent cards grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((agent) => (
          <AgentCard
            key={agent.agentId}
            agent={agent}
            now={now}
            onRestart={handleRestart}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No agents match the current filter.
          </CardContent>
        </Card>
      )}

      {/* Agent summary table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Zap className="size-4 text-muted-foreground" />
            Agent summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Agent</th>
                  <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Bot</th>
                  <th className="hidden px-4 py-2.5 font-medium md:table-cell">PID</th>
                  <th className="hidden px-4 py-2.5 font-medium md:table-cell">Messages</th>
                  <th className="hidden px-4 py-2.5 font-medium lg:table-cell">CPU</th>
                  <th className="hidden px-4 py-2.5 font-medium lg:table-cell">RAM</th>
                  <th className="px-4 py-2.5 text-right font-medium">State</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((a) => {
                  const tone: Tone =
                    a.state === "active"
                      ? "success"
                      : a.state === "idle"
                        ? "warning"
                        : "danger";
                  return (
                    <tr key={a.agentId} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <BadgeDot tone={tone} pulse={a.state === "active"} />
                          <span className="text-sm font-medium">{a.name}</span>
                        </div>
                      </td>
                      <td className="hidden px-4 py-2.5 font-mono text-xs text-muted-foreground sm:table-cell">
                        @{a.connectedBot}
                      </td>
                      <td className="hidden px-4 py-2.5 font-mono text-xs text-muted-foreground md:table-cell">
                        {a.servicePid ?? "—"}
                      </td>
                      <td className="hidden px-4 py-2.5 font-mono text-xs tabular-nums md:table-cell">
                        {a.messagesHandled.toLocaleString()}
                      </td>
                      <td className="hidden px-4 py-2.5 font-mono text-xs tabular-nums lg:table-cell">
                        {a.cpuPercent.toFixed(1)}%
                      </td>
                      <td className="hidden px-4 py-2.5 font-mono text-xs tabular-nums lg:table-cell">
                        {a.memoryMb}MB
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                            toneBg[tone],
                          )}
                        >
                          {a.state}
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
