import { useParams, Link } from "react-router";
import { ArrowLeft, Search } from "lucide-react";
import { CATEGORIES, getCategoryBySlug, getProjectsByCategory } from "@/data/projects";
import { ProjectCard } from "@/components/project/ProjectCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = slug ? getCategoryBySlug(slug) : undefined;
  const [sort, setSort] = useState<"stars" | "name">("stars");
  const [search, setSearch] = useState("");

  if (!category) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <h1 className="text-2xl font-bold">Category not found</h1>
        <Link to="/" className="mt-4 inline-block text-accent hover:underline">
          ← Back to home
        </Link>
      </div>
    );
  }

  const allProjects = getProjectsByCategory(category.name);
  const filtered = allProjects
    .filter(
      (p) =>
        p.repo.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "stars"
        ? b.stars - a.stars
        : a.repo.localeCompare(b.repo),
    );

  const index = CATEGORIES.findIndex((c) => c.slug === slug) + 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-fg-secondary hover:text-fg"
      >
        <ArrowLeft className="size-4" />
        Back to map
      </Link>

      <SectionHeader
        index={String(index).padStart(2, "0")}
        title={category.name}
        description={category.description}
      />

      {/* Controls */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Filter ${allProjects.length} projects…`}
            className="w-full rounded-lg border border-border bg-bg-elevated py-2 pl-10 pr-3 text-sm text-fg placeholder:text-fg-muted focus:border-border-hover focus:outline-none"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "stars" | "name")}
          className="rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-fg focus:border-border-hover focus:outline-none"
        >
          <option value="stars">Most stars</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p, i) => (
          <ProjectCard key={`${p.owner}/${p.repo}`} project={p} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-fg-muted">
          No projects match your filter.
        </div>
      )}
    </div>
  );
}
