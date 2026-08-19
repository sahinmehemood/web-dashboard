import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Loader2, XCircle, SkipForward } from "lucide-react";

type StepStatus = "completed" | "running" | "pending" | "failed" | "skipped";

interface PipelineStep {
  id: string;
  name: string;
  status: StepStatus;
  duration?: string;
  detail?: string;
}

const statusConfig: Record<StepStatus, {
  icon: typeof CheckCircle2;
  color: string;
  bg: string;
  text: string;
}> = {
  completed: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  running: { icon: Loader2, color: "text-blue-500", bg: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
  pending: { icon: Circle, color: "text-muted-foreground/40", bg: "bg-muted-foreground/20", text: "text-muted-foreground" },
  failed: { icon: XCircle, color: "text-red-500", bg: "bg-red-500", text: "text-red-600 dark:text-red-400" },
  skipped: { icon: SkipForward, color: "text-muted-foreground/40", bg: "bg-muted-foreground/20", text: "text-muted-foreground" },
};

export function DeploymentPipeline({
  steps,
  title,
  environment,
  className,
}: {
  steps: PipelineStep[];
  title?: string;
  environment?: string;
  className?: string;
}) {
  const allDone = steps.every((s) => s.status === "completed");
  const hasFailed = steps.some((s) => s.status === "failed");
  const isRunning = steps.some((s) => s.status === "running");

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 space-y-4", className)}>
      {(title || environment) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h3 className="text-sm font-semibold">{title}</h3>}
            {environment && <span className="text-xs text-muted-foreground">{environment}</span>}
          </div>
          <span className={cn(
            "text-[10px] font-medium px-2 py-0.5 rounded-full",
            allDone ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
            hasFailed ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
            "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          )}>
            {allDone ? "Deployed" : hasFailed ? "Failed" : isRunning ? "In Progress" : "Pending"}
          </span>
        </div>
      )}

      {/* Pipeline steps */}
      <div className="flex items-start gap-0">
        {steps.map((step, i) => {
          const cfg = statusConfig[step.status];
          const Icon = cfg.icon;
          return (
            <div key={step.id} className="flex flex-1 items-start last:flex-initial">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "relative flex size-8 items-center justify-center rounded-full transition-colors",
                  step.status === "completed" || step.status === "failed" ? cfg.bg : "border-2 border-border bg-background"
                )}>
                  <Icon className={cn(
                    "size-4",
                    step.status === "completed" || step.status === "failed" ? "text-white" : cfg.color,
                    step.status === "running" && "animate-spin"
                  )} />
                </div>
                <div className="mt-2 text-center max-w-[72px]">
                  <div className="text-[11px] font-medium leading-tight">{step.name}</div>
                  {step.duration && (
                    <div className="text-[10px] text-muted-foreground tabular-nums">{step.duration}</div>
                  )}
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 flex items-center pt-3.5 px-1">
                  <div className={cn(
                    "h-0.5 w-full rounded-full transition-colors duration-500",
                    step.status === "completed" ? "bg-emerald-500" :
                    step.status === "failed" ? "bg-red-500" :
                    "bg-border"
                  )} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
