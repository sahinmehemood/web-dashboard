import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, History, Pause, Play, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { PageHeader } from "@/components/dashboard/page-header";
import { useActivity } from "@/hooks/use-dashboard";
import { useNow, useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";
import type { ActivityEvent, ActivityLevel } from "@/lib/demo";

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "message_handled", label: "Messages" },
  { value: "skill_used", label: "Skills" },
  { value: "cron_fired", label: "Crons" },
  { value: "brain_write", label: "Brain" },
  { value: "command_executed", label: "Commands" },
  { value: "error", label: "Errors" },
];

const RANGE_OPTIONS: { value: string; label: string; ms: number }[] = [
  { value: "24h", label: "24h", ms: 86400000 },
  { value: "7d", label: "7d", ms: 604800000 },
  { value: "30d", label: "30d", ms: 2592000000 },
  { value: "all", label: "All", ms: Infinity },
];

const LEVEL_STYLES: Record<ActivityLevel, string> = {
  info: "border-border bg-card text-muted-foreground",
  success: "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
  warning: "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400",
  error: "border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-400",
};

function downloadCsv(events: ActivityEvent[]) {
  const escape = (value: unknown) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;
  const header = ["Timestamp", "Type", "Title", "Detail", "Level"];
  const rows = events.map((e) => [
    new Date(e.timestamp).toISOString(),
    e.activityType,
    e.title,
    e.detail ?? "",
    e.level,
  ]);
  const csv = [header, ...rows]
    .map((r) => r.map(escape).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hermes-activity-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ActivityPage() {
  const { data: activity } = useActivity(50);
  const { autoRefresh, setAutoRefresh } = useSettings();
  const now = useNow(autoRefresh ? 15000 : 600000);

  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<ActivityLevel | "all">("all");
  const [range, setRange] = useState("30d");

  const rangeMs = useMemo(
    () => RANGE_OPTIONS.find((r) => r.value === range)?.ms ?? Infinity,
    [range],
  );

  const filtered = useMemo(() => {
    return activity.filter((e) => {
      if (filter !== "all" && e.activityType !== filter) return false;
      if (level !== "all" && e.level !== level) return false;
      if (rangeMs !== Infinity && now - e.timestamp > rangeMs) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const hay = `${e.title} ${e.detail ?? ""} ${e.activityType}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [activity, filter, level, rangeMs, query, now]);

  const errors = activity.filter((e) => e.level === "error").length;
  const warnings = activity.filter((e) => e.level === "warning").length;

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Activity"
        description="Live stream of every event handled by your Hermes agent."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (filtered.length === 0) {
              toast.info("Nothing to export", { description: "No events match the current filters." });
              return;
            }
            downloadCsv(filtered);
            toast.success("Exported", {
              description: `${filtered.length} events written to CSV.`,
            });
          }}
        >
          <Download className="size-3.5" />
          Export CSV
        </Button>
      </PageHeader>

      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <History className="size-4 text-muted-foreground" />
            Event stream
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              {filtered.length} shown
            </span>
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={autoRefresh}
                onCheckedChange={(v) => setAutoRefresh(v)}
                id="activity-autorefresh"
              />
              <label
                htmlFor="activity-autorefresh"
                className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground"
              >
                {autoRefresh ? (
                  <Play className="size-3 text-emerald-500" />
                ) : (
                  <Pause className="size-3" />
                )}
                Auto-refresh
              </label>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              {FILTERS.map((f) => (
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
            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events…"
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>

          {/* Level + range filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { value: "all", label: "All levels", className: "border-border bg-card text-muted-foreground" },
                  { value: "info", label: "Info", className: LEVEL_STYLES.info },
                  { value: "success", label: "Success", className: LEVEL_STYLES.success },
                  { value: "warning", label: `Warning (${warnings})`, className: LEVEL_STYLES.warning },
                  { value: "error", label: `Error (${errors})`, className: LEVEL_STYLES.error },
                ] as const
              ).map((lv) => (
                <button
                  key={lv.value}
                  onClick={() => setLevel(lv.value)}
                  className={cn(
                    "cursor-pointer rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-opacity hover:opacity-80",
                    lv.className,
                    level === lv.value ? "ring-1 ring-ring" : "opacity-70",
                  )}
                >
                  {lv.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Range</span>
              {RANGE_OPTIONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRange(r.value)}
                  className={cn(
                    "cursor-pointer rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                    range === r.value
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feed */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center">
                <History className="size-5 text-muted-foreground" />
                <p className="text-sm font-medium">No events match</p>
                <p className="text-xs text-muted-foreground">
                  Try widening your filters or clearing the search.
                </p>
              </div>
            ) : (
              <ActivityFeed events={filtered} now={now} />
            )}
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
