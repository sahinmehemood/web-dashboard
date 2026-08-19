import { useParams, Link } from "react-router";
import { ArrowLeft, Github, Star, GitFork, ShieldCheck, Calendar, Tag } from "lucide-react";
import { getProject, getProjectsByCategory, CATEGORIES } from "@/data/projects";
import { Badge } from "@/components/shared/Badge";
import { ProjectCard } from "@/components/project/ProjectCard";
import { formatStars } from "@/lib/utils";

export function ProjectPage() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const project = owner && repo ? getProject(owner, repo) : undefined;

  if (!project) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <h1 className="text-2xl font-bold">Project not found</h1>
        <Link to="/" className="mt-4 inline-block text-accent hover:underline">
          ← Back to home
        </Link>
      </div>
    );
  }

  const category = CATEGORIES.find((c) => c.name === project.category);
  const related = getProjectsByCategory(project.category)
    .filter((p) => p !== project)
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-fg-secondary hover:text-fg"
      >
        <ArrowLeft className="size-4" />
        Back to map
      </Link>

      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm text-fg-muted">
        {category && (
          <Link
            to={`/category/${category.slug}`}
            className="hover:text-fg"
          >
            {category.name}
          </Link>
        )}
        <span>/</span>
        <span className="font-mono text-fg">{project.repo}</span>
      </div>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-bg-elevated p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {project.official ? (
                <Badge variant="success">
                  <ShieldCheck className="size-3" />
                  official
                </Badge>
              ) : (
                <Badge>community</Badge>
              )}
            </div>
            <h1 className="mt-3 flex flex-wrap items-center gap-1.5 font-mono text-2xl font-bold md:text-3xl">
              <span className="text-fg-muted">{project.owner}</span>
              <span className="text-fg-muted">/</span>
              <span className="text-accent">{project.repo}</span>
            </h1>
            <p className="mt-3 max-w-2xl text-fg-secondary">
              {project.description}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="stars" value={formatStars(project.stars)} icon={Star} tone="text-accent-amber" />
          <Stat label="category" value={project.category.split(" ")[0]} icon={Tag} />
          <Stat label="owner" value={project.owner} icon={Github} />
          <Stat label="status" value={project.official ? "official" : "community"} icon={ShieldCheck} />
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90"
          >
            <Github className="size-4" />
            View on GitHub
          </a>
          <a
            href={`${project.url}/stargazers`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg px-5 py-2.5 text-sm font-medium text-fg transition-colors hover:border-border-hover"
          >
            <Star className="size-4" />
            Star
          </a>
        </div>
      </div>

      {/* Related projects */}
      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">More in {project.category}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {related.map((p) => (
              <ProjectCard key={`${p.owner}/${p.repo}`} project={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  tone = "",
}: {
  label: string;
  value: string;
  icon: typeof Star;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg p-4">
      <div className="flex items-center gap-1.5 text-xs text-fg-muted">
        <Icon className={`size-3.5 ${tone}`} />
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-semibold">{value}</div>
    </div>
  );
}
