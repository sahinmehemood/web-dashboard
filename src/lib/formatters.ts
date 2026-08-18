export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function formatPercent(n: number, digits = 0): string {
  return `${clamp(n, 0, 100).toFixed(digits)}%`;
}

export function formatMb(mb: number, digits = 1): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(digits)} GB`;
  return `${Math.round(mb)} MB`;
}

export function formatGb(gb: number, digits = 1): string {
  if (gb >= 1024) return `${(gb / 1024).toFixed(digits)} TB`;
  return `${gb.toFixed(digits)} GB`;
}

export function formatMs(ms: number | undefined): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function formatUptime(seconds: number): string {
  if (!seconds || seconds < 0) return "—";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function timeAgo(ts?: number, now = Date.now()): string {
  if (!ts) return "—";
  const diff = Math.max(0, now - ts);
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export function formatClock(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatDate(ts?: number): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function pctUsed(used: number, total: number): number {
  if (!total) return 0;
  return clamp((used / total) * 100, 0, 100);
}

export function initials(name?: string): string {
  if (!name) return "GU";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(n);
}