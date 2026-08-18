import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  statusLabel,
  toneBg,
  toneForStatus,
  type Tone,
} from "@/lib/status";

export function StatusBadge({
  status,
  tone,
  className,
}: {
  status: string;
  tone?: Tone;
  className?: string;
}) {
  const resolved = tone ?? toneForStatus(status);
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent font-medium capitalize",
        toneBg[resolved],
        className,
      )}
    >
      {statusLabel(status)}
    </Badge>
  );
}