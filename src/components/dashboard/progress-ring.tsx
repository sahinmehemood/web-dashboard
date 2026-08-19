import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const toneRing: Record<Tone, string> = {
  success: "stroke-emerald-500",
  warning: "stroke-amber-500",
  danger: "stroke-red-500",
  info: "stroke-blue-500",
  neutral: "stroke-muted-foreground/40",
};

const toneText: Record<Tone, string> = {
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
  neutral: "text-muted-foreground",
};

function getTone(pct: number): Tone {
  if (pct >= 80) return "success";
  if (pct >= 50) return "info";
  if (pct >= 30) return "warning";
  return "danger";
}

export function ProgressRing({
  value,
  max = 100,
  size = 64,
  strokeWidth = 5,
  tone,
  label,
  className,
}: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  tone?: Tone;
  label?: string;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);
  const t = tone ?? getTone(pct * 100);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/40"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-700 ease-out", toneRing[t])}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn("text-xs font-bold tabular-nums", toneText[t])}>
          {Math.round(pct * 100)}%
        </span>
        {label && (
          <span className="text-[9px] text-muted-foreground">{label}</span>
        )}
      </div>
    </div>
  );
}

export function Gauge({
  value,
  min = 0,
  max = 100,
  size = 100,
  label,
  tone,
  className,
}: {
  value: number;
  min?: number;
  max?: number;
  size?: number;
  label?: string;
  tone?: Tone;
  className?: string;
}) {
  const startAngle = -225;
  const endAngle = 45;
  const range = endAngle - startAngle;
  const pct = Math.max(0, Math.min((value - min) / (max - min), 1));
  const angle = startAngle + range * pct;
  const r = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2;
  const t = tone ?? getTone(pct * 100);

  const polar = (a: number) => {
    const rad = (a * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const arc = (s: number, e: number) => {
    const p1 = polar(s);
    const p2 = polar(e);
    const large = e - s > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`;
  };

  const toneStroke: Record<Tone, string> = {
    success: "stroke-emerald-500",
    warning: "stroke-amber-500",
    danger: "stroke-red-500",
    info: "stroke-blue-500",
    neutral: "stroke-muted-foreground/40",
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg width={size} height={size * 0.65}>
        <path
          d={arc(startAngle, endAngle)}
          fill="none"
          stroke="currentColor"
          strokeWidth={7}
          strokeLinecap="round"
          className="text-muted/30"
        />
        <path
          d={arc(startAngle, angle)}
          fill="none"
          strokeWidth={7}
          strokeLinecap="round"
          className={cn("transition-all duration-700 ease-out", toneStroke[t])}
        />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-current text-sm font-bold"
        >
          {Math.round(value)}
        </text>
      </svg>
      {label && (
        <span className="text-[10px] text-muted-foreground">{label}</span>
      )}
    </div>
  );
}
