import { Link } from "react-router";
import { Github, Star, ShieldCheck } from "lucide-react";
import type { Project } from "@/data/projects";
import { Badge } from "@/components/shared/Badge";
import { formatStars, cn } from "@/lib/utils";
import { slugifyCategory } from "@/data/projects";

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  return (
    <Link
      to={`/project/${project.owner}/${project.repo}`}
      className={cn(
        "group flex flex-col rounded-xl border border-border bg-bg-elevated p-4 transition-all hover:border-border-hover hover:bg-bg-hover",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-lg font-semibold">
          <span className="font-mono text-sm text-fg-muted">{project.owner}</span>
          <span className="text-fg-muted">/</span>
          <span className="font-mono text-sm text-accent">{project.repo}</span>
        </span>
        {project.official && <Badge variant="success">official</Badge>}
      </div>

      <p className="mt-2 line-clamp-2 flex-1 text-sm text-fg-secondary">
        {project.description}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <span className="flex items-center gap-1 text-sm text-fg-secondary">
          <Star className="size-3.5 text-accent-amber" />
          {formatStars(project.stars)}
        </span>
        <span className="flex items-center gap-1 text-xs text-fg-muted opacity-0 transition-opacity group-hover:opacity-100">
          <Github className="size-3.5" />
          view →
        </span>
      </div>
    </Link>
  );
}

export function ProjectRow({ project }: { project: Project }) {
  return (
    <Link
      to={`/project/${project.owner}/${project.repo}`}
      className="group flex items-center gap-4 rounded-xl border border-border bg-bg-elevated px-4 py-3 transition-all hover:border-border-hover hover:bg-bg-hover"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {project.official ? (
          <ShieldCheck className="size-4 shrink-0 text-accent" />
        ) : (
          <Github className="size-4 shrink-0 text-fg-muted" />
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 font-mono text-sm">
            <span className="text-fg-muted">{project.owner}</span>
            <span className="text-fg-muted">/</span>
            <span className="font-semibold text-accent">{project.repo}</span>
          </div>
          <p className="truncate text-xs text-fg-secondary">
            {project.description}
          </p>
        </div>
      </div>
      <span className="flex shrink-0 items-center gap-1 text-sm text-fg-secondary">
        <Star className="size-3.5 text-accent-amber" />
        {formatStars(project.stars)}
      </span>
    </Link>
  );
}
