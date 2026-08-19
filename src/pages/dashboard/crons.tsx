import { useMemo, useState } from "react";
import { Brain, Shield, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeDot } from "@/lib/status";
import { DataTable } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { useCrons } from "@/hooks/use-dashboard";
import { formatClock, timeAgo } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { CronJob } from "@/lib/demo";

const KIND_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "cron", label: "Cron" },
  { value: "interval", label: "Interval" },
];

export default function CronsPage() {
  const { data: crons, isDemo } = useCrons();
  const [kindFilter, setKindFilter] = useState("all");

  const filtered = useMemo(() => {
    if (kindFilter === "all") return crons;
    return crons.filter((c) => c.kind === kindFilter);
  }, [crons, kindFilter]);

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Crons"
        description="Scheduled jobs — brain automation, health checks, and vault sync."
      >
        <span className="text-xs text-muted-foreground">
          {isDemo ? "Demo data" : "Live"}
        </span>
      </PageHeader>

      <div className="flex flex-wrap gap-2">
        {[
          { label: "Jobs", value: String(crons.length) },
          {
            label: "Enabled",
            value: String(crons.filter((c) => c.enabled).length),
          },
          {
            label: "Total runs",
            value: String(
              crons.reduce((sum, c) => sum + (c.completedCount || 0), 0),
            ),
          },
          { label: "Mode", value: isDemo ? "Demo data" : "Live" },
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
            <Timer className="size-4 text-muted-foreground" />
            Scheduled jobs
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {filtered.length} shown
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable<CronJob>
            data={filtered}
            searchKeys={["name"]}
            searchPlaceholder="Search jobs…"
            toolbar={
              <div className="flex flex-wrap items-center gap-1.5">
                {KIND_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setKindFilter(f.value)}
                    className={cn(
                      "cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                      kindFilter === f.value
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            }
            initialSortKey="name"
            columns={[
              {
                key: "name",
                header: "Job",
                sortable: true,
                render: (c) => {
                  const Icon = c.name.startsWith("brain-") ? Brain : Shield;
                  return (
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <Icon className="size-3.5" />
                      </span>
                      <div className="min-w-0">
                        <div className="truncate font-mono text-xs font-medium">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground sm:hidden">
                          {c.kind}
                          {c.noAgent ? " · no agent" : ""}
                        </div>
                      </div>
                    </div>
                  );
                },
              },
              {
                key: "schedule",
                header: "Schedule",
                render: (c) => (
                  <span className="font-mono text-xs text-muted-foreground">
                    {c.schedule}
                  </span>
                ),
              },
              {
                key: "kind",
                header: "Type",
                headerClassName: "hidden sm:table-cell",
                className: "hidden capitalize sm:table-cell",
                render: (c) => (
                  <span className="text-xs text-muted-foreground">
                    {c.kind}
                    {c.noAgent ? " · no agent" : ""}
                  </span>
                ),
              },
              {
                key: "status",
                header: "Status",
                render: (c) => (
                  <div className="flex items-center gap-2">
                    <BadgeDot
                      tone={c.enabled ? "success" : "neutral"}
                      pulse={c.enabled}
                    />
                    {c.lastStatus ? (
                      <StatusBadge status={c.lastStatus} />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                ),
              },
              {
                key: "lastRunAt",
                header: "Last run",
                headerClassName: "hidden md:table-cell",
                className: "hidden md:table-cell",
                sortable: true,
                sortValue: (c) => c.lastRunAt ?? 0,
                render: (c) => (
                  <span className="text-xs text-muted-foreground">
                    {c.lastRunAt ? `${formatClock(c.lastRunAt)} (${timeAgo(c.lastRunAt)})` : "—"}
                  </span>
                ),
              },
              {
                key: "nextRunAt",
                header: "Next run",
                headerClassName: "hidden md:table-cell",
                className: "hidden md:table-cell",
                sortable: true,
                sortValue: (c) => c.nextRunAt ?? 0,
                render: (c) => (
                  <span className="text-xs text-muted-foreground">
                    {c.nextRunAt ? timeAgo(c.nextRunAt) : "—"}
                  </span>
                ),
              },
              {
                key: "completedCount",
                header: "Runs",
                headerClassName: "text-right",
                className: "text-right",
                sortable: true,
                sortValue: (c) => c.completedCount ?? 0,
                render: (c) => (
                  <span className="font-mono text-xs tabular-nums">
                    {c.completedCount}
                  </span>
                ),
              },
            ]}
            footerCount={(count, total) => (
              <span className="text-xs text-muted-foreground">
                {count} of {total} jobs
              </span>
            )}
            pagination={{ enabled: true, defaultPageSize: 10, pageSizeOptions: [10, 25, 50] }}
          />
        </CardContent>
      </Card>
    </div>
  );
}