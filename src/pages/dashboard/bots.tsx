import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  Bot,
  Clock,
  RefreshCw,
  Timer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeDot } from "@/lib/status";
import { DataTable } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { useBots, useSendCommand } from "@/hooks/use-dashboard";
import { DID } from "@/lib/demo";
import { timeAgo } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { TelegramBot } from "@/lib/demo";

const ROLE_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All roles" },
  { value: "main_gateway", label: "Main gateway" },
  { value: "second_gateway", label: "Second gateway" },
  { value: "alerts", label: "Alerts" },
  { value: "legacy", label: "Legacy" },
];

export default function BotsPage() {
  const { data: bots } = useBots();
  const send = useSendCommand();
  const [roleFilter, setRoleFilter] = useState("all");
  const now = Date.now();

  const filtered = useMemo(() => {
    if (roleFilter === "all") return bots;
    return bots.filter((b) => b.role === roleFilter);
  }, [bots, roleFilter]);

  const live = bots.filter((b) => b.status === "live").length;
  const totalMessages = bots.reduce((s, b) => s + (b.messagesHandled ?? 0), 0);
  const totalErrors = bots.reduce((s, b) => s + (b.errorsToday ?? 0), 0);

  const handleRestart = async (username: string) => {
    try {
      await send({ deviceId: DID, commandType: "restart_hermes" });
      toast.success("Restart dispatched", {
        description: `Restart command sent for @${username}.`,
      });
    } catch (error) {
      toast.error("Restart failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bots"
        description="Telegram bot inventory — gateways, roles, connection state, and activity metrics."
      >
        <span className="text-xs text-muted-foreground">
          {live}/{bots.length} live
        </span>
      </PageHeader>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Bots", value: String(bots.length) },
          { label: "Live", value: String(live) },
          {
            label: "Gateways",
            value: String(
              bots.filter((b) => b.role.includes("gateway")).length,
            ),
          },
          {
            label: "Messages",
            value: totalMessages.toLocaleString(),
            icon: Activity,
          },
          {
            label: "Errors",
            value: String(totalErrors),
            icon: AlertTriangle,
            warn: totalErrors > 0,
          },
        ].map((item) => (
          <span
            key={item.label}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs",
              item.warn ? "border-amber-500/30 text-amber-700 dark:text-amber-400" : "text-muted-foreground",
            )}
          >
            {item.icon && <item.icon className="size-3" />}
            <span className="font-medium text-foreground">{item.value}</span>
            {item.label}
          </span>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Bot className="size-4 text-violet-500" />
            Inventory
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {filtered.length} shown
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable<TelegramBot>
            data={filtered}
            searchKeys={["username", "botId"]}
            searchPlaceholder="Search bots…"
            toolbar={
              <div className="flex flex-wrap items-center gap-1.5">
                {ROLE_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setRoleFilter(f.value)}
                    className={cn(
                      "cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                      roleFilter === f.value
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            }
            initialSortKey="username"
            columns={[
              {
                key: "username",
                header: "Bot",
                sortable: true,
                render: (b) => (
                  <div className="flex items-center gap-2">
                    <BadgeDot
                      tone={b.status === "live" ? "success" : "danger"}
                      pulse={b.status === "live"}
                    />
                    <div className="min-w-0">
                      <span className="text-sm font-medium">@{b.username}</span>
                      {b.lastSeenAt && (
                        <div className="text-[11px] text-muted-foreground">
                          Last seen {timeAgo(b.lastSeenAt, now)}
                        </div>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                key: "role",
                header: "Role",
                sortable: true,
                render: (b) => (
                  <span className="capitalize text-muted-foreground">
                    {b.role.replace(/_/g, " ")}
                  </span>
                ),
              },
              {
                key: "messagesHandled",
                header: "Messages",
                sortable: true,
                sortValue: (b) => b.messagesHandled ?? 0,
                headerClassName: "hidden sm:table-cell",
                className: "hidden sm:table-cell",
                render: (b) => (
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {(b.messagesHandled ?? 0).toLocaleString()}
                  </span>
                ),
              },
              {
                key: "errorsToday",
                header: "Errors",
                sortable: true,
                sortValue: (b) => b.errorsToday ?? 0,
                headerClassName: "hidden md:table-cell",
                className: "hidden md:table-cell",
                render: (b) => {
                  const errors = b.errorsToday ?? 0;
                  return (
                    <span
                      className={cn(
                        "font-mono text-xs tabular-nums",
                        errors > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground",
                      )}
                    >
                      {errors}
                    </span>
                  );
                },
              },
              {
                key: "avgResponseMs",
                header: "Avg ms",
                sortable: true,
                sortValue: (b) => b.avgResponseMs ?? 0,
                headerClassName: "hidden lg:table-cell",
                className: "hidden lg:table-cell",
                render: (b) => (
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {b.avgResponseMs ? `${b.avgResponseMs}ms` : "—"}
                  </span>
                ),
              },
              {
                key: "apiPort",
                header: "Port",
                headerClassName: "hidden lg:table-cell",
                className: "hidden lg:table-cell",
                render: (b) => (
                  <span className="font-mono text-xs text-muted-foreground">
                    {b.apiPort ?? "—"}
                  </span>
                ),
              },
              {
                key: "status",
                header: "Status",
                headerClassName: "text-right",
                className: "text-right",
                sortable: true,
                sortValue: (b) => b.status,
                render: (b) => (
                  <div className="flex items-center justify-end gap-1.5">
                    <StatusBadge status={b.status} />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      onClick={() => handleRestart(b.username)}
                      title={`Restart @${b.username}`}
                    >
                      <RefreshCw className="size-3" />
                    </Button>
                  </div>
                ),
              },
            ]}
            footerCount={(count, total) => (
              <span className="text-xs text-muted-foreground">
                {count} of {total} bots
              </span>
            )}
            pagination={{ enabled: true, defaultPageSize: 10, pageSizeOptions: [10, 25, 50] }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
