import { useMemo, useState } from "react";
import { Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeDot } from "@/lib/status";
import { DataTable } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { useBots } from "@/hooks/use-dashboard";
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
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = useMemo(() => {
    if (roleFilter === "all") return bots;
    return bots.filter((b) => b.role === roleFilter);
  }, [bots, roleFilter]);

  const live = bots.filter((b) => b.status === "live").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bots"
        description="Telegram bot inventory — gateways, roles, and connection state."
      >
        <span className="text-xs text-muted-foreground">
          {live}/{bots.length} live
        </span>
      </PageHeader>

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
        ].map((item) => (
          <span
            key={item.label}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
          >
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
                    <span className="text-sm font-medium">@{b.username}</span>
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
                key: "botId",
                header: "ID",
                headerClassName: "hidden sm:table-cell",
                className: "hidden sm:table-cell",
                render: (b) => (
                  <span className="font-mono text-xs text-muted-foreground">
                    {b.botId}
                  </span>
                ),
              },
              {
                key: "apiPort",
                header: "Port",
                headerClassName: "hidden md:table-cell",
                className: "hidden md:table-cell",
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
                  <div className="flex justify-end">
                    <StatusBadge status={b.status} />
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