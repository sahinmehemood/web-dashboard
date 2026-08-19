import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { toneBar, toneText, type Tone } from "@/lib/status";

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "neutral",
  progress,
  chart,
  delta,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  tone?: Tone;
  progress?: number;
  chart?: ReactNode;
  delta?: { value: number; label?: string };
  className?: string;
}) {
  const deltaTone: Tone =
    delta == null || delta.value === 0
      ? "neutral"
      : delta.value > 0
        ? "success"
        : "danger";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
      className={cn(
        "group flex flex-col rounded-xl border border-border bg-card p-4 shadow-xs transition-shadow hover:shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md bg-muted",
            toneText[tone],
          )}
        >
          <Icon className="size-3.5" />
        </span>
        <span className="truncate text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight tabular-nums">
          {value}
        </span>
        {delta != null && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[11px] font-medium tabular-nums",
              toneText[deltaTone],
            )}
          >
            {delta.value > 0 ? (
              <ArrowUpRight className="size-3" />
            ) : delta.value < 0 ? (
              <ArrowDownRight className="size-3" />
            ) : null}
            {delta.value > 0 ? "+" : ""}
            {delta.value.toFixed(1)}%
          </span>
        )}
      </div>
      {sub && (
        <div className="mt-0.5 truncate text-xs text-muted-foreground">{sub}</div>
      )}
      {progress != null && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              toneBar[tone],
            )}
            style={{
              width: `${Math.min(100, Math.max(0, progress))}%`,
            }}
          />
        </div>
      )}
      {chart && <div className="mt-3">{chart}</div>}
    </motion.div>
  );
}