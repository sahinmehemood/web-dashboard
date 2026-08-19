import { useMemo, useState } from "react";
import { AlertTriangle, Search, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeDot, type Tone } from "@/lib/status";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CodeBlock } from "@/components/dashboard/code-block";
import { MetricChart } from "@/components/dashboard/metric-chart";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { useProviders } from "@/hooks/use-dashboard";
import { ROUTER_TEXT } from "@/lib/demo";
import { makeHistory } from "@/lib/history";
import { formatMs } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { ApiProvider } from "@/lib/demo";

const HEALTH_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "healthy", label: "Healthy" },
  { value: "warning", label: "Warning" },
  { value: "error", label: "Error" },
];

function providerHealth(p: ApiProvider): Tone {
  const healthy = p.models.every((m) => m.status === "healthy");
  if (healthy) return "success";
  return p.failureReason === "rate_limit" ? "warning" : "danger";
}

export default function ProvidersPage() {
  const { data: providers } = useProviders();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    return providers.filter((p) => {
      if (filter === "healthy" && providerHealth(p) !== "success") return false;
      if (filter === "warning" && providerHealth(p) !== "warning") return false;
      if (filter === "error" && providerHealth(p) !== "danger") return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const hay = `${p.displayName} ${p.name} ${p.baseUrl ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [providers, query, filter]);

  const healthyProviders = providers.filter(
    (p) => providerHealth(p) === "success",
  ).length;

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Providers"
        description="API providers and model routing health — latency, status, and rate limits."
      >
        <span className="text-xs text-muted-foreground">
          {healthyProviders}/{providers.length} healthy
        </span>
      </PageHeader>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {HEALTH_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                filter === f.value
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-60">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search providers…"
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-14 text-center">
          <Search className="size-5 text-muted-foreground" />
          <p className="text-sm font-medium">No providers match</p>
          <p className="text-xs text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const tone = providerHealth(p);
            return (
              <Card key={p.name} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <CardTitle className="truncate text-sm font-semibold">
                        {p.displayName}
                      </CardTitle>
                      {p.models.some((m) => m.isDefault) && (
                        <Badge
                          variant="outline"
                          className="shrink-0 border-transparent bg-blue-500/10 text-[10px] font-medium text-blue-700 dark:text-blue-400"
                        >
                          DEFAULT
                        </Badge>
                      )}
                    </div>
                    <BadgeDot tone={tone} className="mt-1.5" pulse={tone === "success"} />
                  </div>
                  {p.baseUrl && (
                    <p className="truncate font-mono text-[10px] text-muted-foreground">
                      {p.baseUrl}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex-1 space-y-2">
                  {p.models.map((m) => {
                    const latency = m.lastLatencyMs;
                    return (
                      <div
                        key={m.name}
                        className="flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="truncate font-mono">{m.name}</span>
                        <span className="flex shrink-0 items-center gap-2">
                          {latency != null && (
                            <>
                              <span className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                                <span
                                  className={cn(
                                    "block h-full rounded-full transition-all duration-500",
                                    latency < 500
                                      ? "bg-emerald-500"
                                      : latency < 1000
                                        ? "bg-amber-500"
                                        : "bg-red-500",
                                  )}
                                  style={{
                                    width: `${Math.min(100, (latency / 2000) * 100)}%`,
                                  }}
                                />
                              </span>
                              <span className="w-12 text-right font-mono text-[10px] text-muted-foreground">
                                {formatMs(latency)}
                              </span>
                            </>
                          )}
                          <StatusBadge status={m.status ?? "unknown"} />
                        </span>
                      </div>
                    );
                  })}
                  {p.failureReason && (
                    <p className="flex items-center gap-1 pt-1 text-[11px] text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="size-3" />
                      {p.failureReason.replace(/_/g, " ")}
                    </p>
                  )}
                  <MetricChart
                    data={makeHistory(
                      p.name.length * 13,
                      20,
                      600,
                      180,
                      100,
                      2500,
                    )}
                    tone={tone}
                    height={28}
                    className="pt-1"
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Zap className="size-4 text-amber-500" />
            Model routing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock text={ROUTER_TEXT} />
        </CardContent>
      </Card>
    </div>
  );
}