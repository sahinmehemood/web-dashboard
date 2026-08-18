import { useMemo, useState } from "react";
import { Crown, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeDot, toneBg, toneForStatus, type Tone } from "@/lib/status";
import { CodeBlock } from "@/components/dashboard/code-block";
import { DataTable } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { useCrown, useSendCommand } from "@/hooks/use-dashboard";
import { CROWN_TEXT, DID } from "@/lib/demo";
import { cn } from "@/lib/utils";
import type { CrownService } from "@/lib/demo";

const SERVICE_DESC: Record<string, string> = {
  bot: "Main TG gateway · :8642",
  bot2: "2nd TG gateway · :8643",
  web: "Hermes WebUI · :9119",
  search: "SearXNG · :8888",
  tunnel: "Serveo → nobilem",
  proxy: ":9120 → :9119",
  scraper: "Trafilatura · :8777",
};

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "run", label: "Up" },
  { value: "down", label: "Down" },
  { value: "finish", label: "Finishing" },
];

export default function CrownPage() {
  const { data: crown, isDemo } = useCrown();
  const send = useSendCommand();
  const [statusFilter, setStatusFilter] = useState("all");

  const upSvc = crown.services.filter((s) => s.status === "run").length;
  const statusTone: Tone = crown.crownStatus === "GREEN" ? "success" : "danger";

  const filtered = useMemo(() => {
    if (statusFilter === "all") return crown.services;
    return crown.services.filter((s) => s.status === statusFilter);
  }, [crown.services, statusFilter]);

  const check = async () => {
    try {
      await send({ deviceId: DID, commandType: "crown_status" });
      toast.success("Checking crown", {
        description: "crown_status dispatched — services will refresh shortly.",
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
        title="Crown"
        description="runit supervisor — service supervision, lifecycle, and health."
      >
        <Button variant="outline" size="sm" onClick={check}>
          <RefreshCw className="size-3.5" />
          Check status
        </Button>
      </PageHeader>

      {/* Summary strip */}
      <div className="flex flex-wrap gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
            toneBg[statusTone],
          )}
        >
          <BadgeDot tone={statusTone} pulse />
          {crown.crownStatus}
        </span>
        {[
          { label: "Services up", value: `${upSvc}/${crown.services.length}` },
          { label: "runsvdir", value: String(crown.runsvdirCount) },
          { label: "Orphans", value: String(crown.orphans) },
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
            <Crown className="size-4 text-amber-500" />
            Services
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {filtered.length} shown
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable<CrownService>
            data={filtered}
            searchKeys={["name"]}
            searchPlaceholder="Search services…"
            toolbar={
              <div className="flex flex-wrap items-center gap-1.5">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value)}
                    className={cn(
                      "cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                      statusFilter === f.value
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
                header: "Service",
                sortable: true,
                render: (s) => (
                  <div className="flex items-center gap-2">
                    <BadgeDot tone={toneForStatus(s.status)} pulse={s.status === "run"} />
                    <span className="font-mono text-xs font-medium">{s.name}</span>
                  </div>
                ),
              },
              {
                key: "status",
                header: "Status",
                sortable: true,
                render: (s) => <StatusBadge status={s.status} />,
              },
              {
                key: "pid",
                header: "PID",
                headerClassName: "hidden sm:table-cell",
                className: "hidden sm:table-cell",
                render: (s) => (
                  <span className="font-mono text-xs text-muted-foreground">
                    {s.pid ?? "—"}
                  </span>
                ),
              },
              {
                key: "uptime",
                header: "Uptime",
                headerClassName: "hidden md:table-cell",
                className: "hidden md:table-cell",
                render: (s) => (
                  <span className="text-muted-foreground">{s.uptime ?? "—"}</span>
                ),
              },
              {
                key: "name",
                header: "Description",
                headerClassName: "hidden lg:table-cell",
                className: "hidden text-xs text-muted-foreground lg:table-cell",
                render: (s) => SERVICE_DESC[s.name] ?? "—",
              },
            ]}
            footerCount={(count, total) => (
              <span className="text-xs text-muted-foreground">
                {count} of {total} services
              </span>
            )}
            pagination={{ enabled: true, defaultPageSize: 10, pageSizeOptions: [10, 25, 50] }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock text={CROWN_TEXT} />
        </CardContent>
      </Card>
    </div>
  );
}