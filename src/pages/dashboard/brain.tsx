import { useMemo } from "react";
import {
  BookOpen,
  Brain,
  Calendar,
  Database,
  FileText,
  GitBranch,
  History,
  Inbox,
  InboxIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeDot } from "@/lib/status";
import { CodeBlock } from "@/components/dashboard/code-block";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { useBrain } from "@/hooks/use-dashboard";
import { VAULT_TEXT } from "@/lib/demo";
import { formatDate, timeAgo } from "@/lib/formatters";
import { cn } from "@/lib/utils";

const AUTOMATIONS = [
  {
    name: "brain-autosave",
    detail: "Every 2h · sessions → Daily Notes",
  },
  {
    name: "brain-ingest",
    detail: "23:00 daily · classify → Decisions/Wiki",
  },
  {
    name: "nous-git-sync",
    detail: "Every 30m · commit + push vault",
  },
  {
    name: "brain-safety-net",
    detail: "23:30 daily · vault integrity check",
  },
];

const DISTRIBUTION = [
  { label: "Notes", value: 0, color: "bg-foreground" },
  { label: "Wiki", value: 0, color: "bg-blue-500" },
  { label: "Sources", value: 0, color: "bg-violet-500" },
  { label: "Daily", value: 0, color: "bg-emerald-500" },
  { label: "Sessions", value: 0, color: "bg-amber-500" },
];

export default function BrainPage() {
  const { data: brain } = useBrain();

  const stats = [
    { icon: FileText, label: "Notes", value: brain.totalNotes, tone: "neutral" },
    { icon: BookOpen, label: "Wiki pages", value: brain.wikiPages, tone: "neutral" },
    { icon: Database, label: "Sources", value: brain.sources, tone: "neutral" },
    { icon: Inbox, label: "Inbox", value: brain.inboxItems, tone: "warning" },
    { icon: Calendar, label: "Daily notes", value: brain.dailyNotes, tone: "neutral" },
    { icon: History, label: "Sessions", value: brain.sessionLogs, tone: "neutral" },
  ] as const;

  const distribution = useMemo(() => {
    const total =
      brain.totalNotes +
      brain.wikiPages +
      brain.sources +
      brain.dailyNotes +
      brain.sessionLogs;
    const base = total || 1;
    return [
      { ...DISTRIBUTION[0], value: Math.round((brain.totalNotes / base) * 100) },
      { ...DISTRIBUTION[1], value: Math.round((brain.wikiPages / base) * 100) },
      { ...DISTRIBUTION[2], value: Math.round((brain.sources / base) * 100) },
      { ...DISTRIBUTION[3], value: Math.round((brain.dailyNotes / base) * 100) },
      { ...DISTRIBUTION[4], value: Math.round((brain.sessionLogs / base) * 100) },
    ];
  }, [brain]);

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Brain"
        description="NOUS — your second brain vault: notes, sources, and knowledge automations."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map(({ icon, label, value, tone }) => (
          <StatCard
            key={label}
            icon={icon}
            label={label}
            value={String(value)}
            tone={tone}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <InboxIcon className="size-4 text-muted-foreground" />
              Knowledge distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2.5">
              {distribution.map((d) => (
                <div key={d.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{d.label}</span>
                    <span className="font-medium tabular-nums">{d.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", d.color)}
                      style={{ width: `${d.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-border pt-4">
              <div className="rounded-lg border border-border px-3 py-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <GitBranch className="size-3" />
                  Last git sync
                </div>
                <div className="mt-1 text-sm font-medium tabular-nums">
                  {brain.lastGitSyncAt ? timeAgo(brain.lastGitSyncAt) : "—"}
                </div>
              </div>
              <div className="rounded-lg border border-border px-3 py-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Database className="size-3" />
                  Last ingest
                </div>
                <div className="mt-1 text-sm font-medium tabular-nums">
                  {brain.lastIngestAt ? timeAgo(brain.lastIngestAt) : "—"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
              <BadgeDot tone="success" pulse />
              Vault integrity check passed
              <span className="ml-auto font-mono text-[10px]">
                {brain.lastGitSyncAt ? formatDate(brain.lastGitSyncAt) : ""}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Brain className="size-4 text-emerald-500" />
              Vault structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock text={VAULT_TEXT} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Calendar className="size-4 text-muted-foreground" />
              Automations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {AUTOMATIONS.map((a) => (
              <div
                key={a.name}
                className="rounded-lg border border-border bg-secondary/40 px-3 py-2.5"
              >
                <div className="font-mono text-xs font-medium">{a.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {a.detail}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}