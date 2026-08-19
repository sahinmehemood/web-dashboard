import { cn } from "@/lib/utils";

export function CodeBlock({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <pre
      role="code"
      tabIndex={0}
      className={cn(
        "overflow-x-auto rounded-lg border border-border bg-secondary/60 p-4 font-mono text-xs leading-relaxed text-muted-foreground outline-none focus:ring-1 focus:ring-ring",
        className,
      )}
    >
      {text}
    </pre>
  );
}