import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { CrownHealth } from "@/lib/demo";

interface ServiceNode {
  id: string;
  label: string;
  x: number;
  y: number;
  status: "run" | "stop" | "fail" | "warn";
  type: "gateway" | "service" | "database" | "network" | "search";
}

interface ServiceEdge {
  from: string;
  to: string;
  label?: string;
}

const NODES: ServiceNode[] = [
  { id: "tunnel", label: "tunnel", x: 400, y: 40, status: "run", type: "network" },
  { id: "proxy", label: "proxy", x: 250, y: 120, status: "run", type: "network" },
  { id: "web", label: "web", x: 400, y: 120, status: "run", type: "service" },
  { id: "bot", label: "bot", x: 250, y: 220, status: "run", type: "gateway" },
  { id: "bot2", label: "bot2", x: 400, y: 220, status: "run", type: "gateway" },
  { id: "search", label: "search", x: 550, y: 170, status: "run", type: "search" },
  { id: "scraper", label: "scraper", x: 550, y: 270, status: "run", type: "service" },
];

const EDGES: ServiceEdge[] = [
  { from: "tunnel", to: "web", label: "exposes" },
  { from: "proxy", to: "web", label: "routes" },
  { from: "web", to: "bot", label: "manages" },
  { from: "web", to: "bot2", label: "manages" },
  { from: "bot", to: "search", label: "queries" },
  { from: "bot2", to: "search", label: "queries" },
  { from: "scraper", to: "search", label: "uses" },
];

const statusColor = {
  run: "fill-emerald-500",
  stop: "fill-muted-foreground/40",
  fail: "fill-red-500",
  warn: "fill-amber-500",
} as const;

const statusGlow = {
  run: "fill-emerald-500/20",
  stop: "fill-muted/10",
  fail: "fill-red-500/20",
  warn: "fill-amber-500/20",
} as const;

const typeIcon: Record<ServiceNode["type"], string> = {
  gateway: "🤖",
  service: "⚙️",
  database: "💾",
  network: "🌐",
  search: "🔍",
};

export function SystemTopology({
  services,
  className,
}: {
  services: CrownHealth["services"];
  className?: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const nodes = NODES.map((n) => {
    const svc = services.find((s) => s.name === n.id);
    return { ...n, status: (svc?.status ?? "stop") as ServiceNode["status"] };
  });

  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-border bg-card", className)}>
      <svg viewBox="0 0 700 340" className="w-full h-auto">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-muted-foreground/40" />
          </marker>
        </defs>

        {/* Edges */}
        {EDGES.map((e) => {
          const from = nodes.find((n) => n.id === e.from);
          const to = nodes.find((n) => n.id === e.to);
          if (!from || !to) return null;
          const isHighlighted = hovered === e.from || hovered === e.to;
          return (
            <g key={`${e.from}-${e.to}`}>
              <line
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke="currentColor"
                strokeWidth={isHighlighted ? 2 : 1}
                strokeDasharray={isHighlighted ? "none" : "4 4"}
                markerEnd="url(#arrow)"
                className={cn(
                  "transition-all duration-200",
                  isHighlighted ? "stroke-foreground/60" : "stroke-muted-foreground/25"
                )}
              />
              {e.label && (
                <text
                  x={(from.x + to.x) / 2}
                  y={(from.y + to.y) / 2 - 6}
                  textAnchor="middle"
                  className="fill-muted-foreground/50 text-[8px]"
                >
                  {e.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((n) => {
          const isHovered = hovered === n.id;
          return (
            <g
              key={n.id}
              onMouseEnter={() => setHovered(n.id)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              {/* Glow */}
              <circle
                cx={n.x} cy={n.y} r={isHovered ? 28 : 24}
                className={cn(statusGlow[n.status], "transition-all duration-200")}
              />
              {/* Ring */}
              <circle
                cx={n.x} cy={n.y} r={20}
                fill="currentColor"
                className="fill-card stroke-border"
                strokeWidth={1.5}
              />
              {/* Status dot */}
              <circle
                cx={n.x} cy={n.y} r={5}
                className={cn(statusColor[n.status], "transition-colors duration-200")}
              />
              {/* Label */}
              <text
                x={n.x} y={n.y + 34}
                textAnchor="middle"
                className="fill-foreground text-[10px] font-mono font-medium"
              >
                {n.label}
              </text>
              {/* Type icon */}
              <text
                x={n.x} y={n.y + 46}
                textAnchor="middle"
                className="text-[8px]"
              >
                {typeIcon[n.type]}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-emerald-500" /> running
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-amber-500" /> warning
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-red-500" /> failed
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-muted-foreground/40" /> stopped
        </span>
      </div>
    </div>
  );
}
