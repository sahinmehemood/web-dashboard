import {
  Activity,
  AlertTriangle,
  Bot,
  Brain,
  Clock,
  GitBranch,
  MessageSquare,
  RefreshCw,
  Terminal,
  Webhook,
  type LucideIcon,
} from "lucide-react";
import { BadgeDot, type Tone } from "@/lib/status";
import { timeAgo } from "@/lib/formatters";
import type { ActivityEvent } from "@/lib/demo";
import { cn } from "@/lib/utils";

const TYPE_META: Record<
  string,
  { icon: LucideIcon; tone: Tone; label: string }
> = {
  message_handled: {
    icon: MessageSquare,
    tone: "info",
    label: "Message",
  },
  skill_used: { icon: Brain, tone: "info", label: "Skill" },
  cron_fired: { icon: Clock, tone: "success", label: "Cron" },
  brain_write: { icon: Brain, tone: "info", label: "Brain" },
  command_executed: { icon: Terminal, tone: "success", label: "Command" },
  provider_health: { icon: Activity, tone: "warning", label: "Health" },
  error: { icon: AlertTriangle, tone: "danger", label: "Error" },
  restart: { icon: RefreshCw, tone: "success", label: "Restart" },
  webhook: { icon: Webhook, tone: "info", label: "Webhook" },
  git_sync: { icon: GitBranch, tone: "success", label: "Git" },
  bot_event: { icon: Bot, tone: "info", label: "Bot" },
};

function typeMeta(type: string): { icon: LucideIcon; tone: Tone; label: string } {
  return TYPE_META[type] ?? { icon: Activity, tone: "neutral", label: type };
}

export function activityIcon(type: string) {
  return typeMeta(type).icon;
}

export function ActivityFeed({
  events,
  now,
  className,
}: {
  events: ActivityEvent[];
  now?: number;
  className?: string;
}) {
  return (
    <div className={cn("divide-y divide-border/60", className)}>
      {events.map((event, i) => {
        const { icon: Icon, tone } = typeMeta(event.activityType);
        return (
          <div key={`${event.timestamp}-${i}`} className="flex items-start gap-3 py-2.5">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Icon className="size-3" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">
                  {event.title}
                </span>
                <BadgeDot tone={tone} />
              </div>
              {event.detail && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {event.detail}
                </p>
              )}
            </div>
            <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/70">
              {timeAgo(event.timestamp, now)}
            </span>
          </div>
        );
      })}
    </div>
  );
}