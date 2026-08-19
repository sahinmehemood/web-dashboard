import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}) {
  const variants = {
    default: "border-border bg-bg-elevated text-fg-secondary",
    success: "border-accent/30 bg-accent/10 text-accent",
    warning: "border-accent-amber/30 bg-accent-amber/10 text-accent-amber",
    danger: "border-accent-red/30 bg-accent-red/10 text-accent-red",
    info: "border-accent-blue/30 bg-accent-blue/10 text-accent-blue",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
