import { cn } from "@/lib/utils";

export type Tone = "neutral" | "success" | "warning" | "danger" | "info";

export const toneText: Record<Tone, string> = {
  neutral: "text-muted-foreground",
  success: "text-emerald-700 dark:text-emerald-400",
  warning: "text-amber-700 dark:text-amber-400",
  danger: "text-red-700 dark:text-red-400",
  info: "text-blue-700 dark:text-blue-400",
};

export const toneBg: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  danger: "bg-red-500/10 text-red-700 dark:text-red-400",
  info: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
};

export const toneDot: Record<Tone, string> = {
  neutral: "bg-muted-foreground/50",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
};

export const toneBar: Record<Tone, string> = {
  neutral: "bg-muted-foreground/50",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
};

export function toneForStatus(status: string): Tone {
  switch (status?.toLowerCase()) {
    case "run":
    case "live":
    case "healthy":
    case "ok":
    case "green":
    case "scheduled":
    case "executed":
    case "up":
      return "success";
    case "rate_limited":
    case "cooldown":
    case "warning":
    case "yellow":
    case "finish":
    case "pending":
      return "warning";
    case "error":
    case "dead":
    case "down":
    case "red":
    case "failed":
    case "unknown":
      return "danger";
    default:
      return "neutral";
  }
}

export function statusLabel(status: string): string {
  return status?.replace(/_/g, " ") ?? "—";
}

export function BadgeDot({
  tone,
  className,
  pulse = false,
}: {
  tone: Tone;
  className?: string;
  pulse?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-block size-1.5 shrink-0 rounded-full",
        toneDot[tone],
        pulse && "animate-pulse",
        className,
      )}
    />
  );
}