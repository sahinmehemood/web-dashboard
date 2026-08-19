import { cn } from "@/lib/utils";

export function SectionHeader({
  index,
  title,
  description,
  className,
}: {
  index: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="section-prefix mb-2">//{index}</div>
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
      {description && (
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-fg-secondary)]">
          {description}
        </p>
      )}
    </div>
  );
}
