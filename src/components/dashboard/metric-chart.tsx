import { useId } from "react";
import { cn } from "@/lib/utils";
import { toneText, type Tone } from "@/lib/status";

function buildPaths(data: number[], width: number, height: number) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((v, i) => ({
    x: i * step,
    y: height - ((v - min) / span) * (height - 4) - 2,
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
  const area = `${line} L${width} ${height} L0 ${height} Z`;
  return { line, area, last: pts[pts.length - 1] };
}

export function MetricChart({
  data,
  tone = "neutral",
  height = 40,
  className,
}: {
  data: number[];
  tone?: Tone;
  height?: number;
  className?: string;
}) {
  const gid = useId();
  const width = 120;
  if (data.length < 2) {
    return (
      <div
        style={{ height }}
        className={cn("w-full", className)}
        aria-hidden
      />
    );
  }
  const { line, area, last } = buildPaths(data, width, height);
  const stroke = toneText[tone];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ height }}
      className={cn("w-full overflow-visible", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} className={stroke} />
      <path
        d={line}
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className={stroke}
      />
      <circle
        cx={last.x}
        cy={last.y}
        r="2.5"
        fill="currentColor"
        vectorEffect="non-scaling-stroke"
        className={stroke}
      />
    </svg>
  );
}