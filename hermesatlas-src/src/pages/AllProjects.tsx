import { useState } from "react";
import { Search } from "lucide-react";
import { PROJECTS, CATEGORIES } from "@/data/projects";
import { ProjectCard } from "@/components/project/ProjectCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { cn } from "@/lib/utils";

export function AllProjects() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"stars" | "name">("stars");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = PROJECTS.filter((p) => {
    const matchesSearch =
      !search ||
      p.repo.toLowerCase().includes(search.toLowerCase()) ||
      p.owner.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) =>
    sort === "stars" ? b.stars - a.stars : a.repo.localeCompare(b.repo),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <SectionHeader
        index="00"
        title="All projects"
        description={`${PROJECTS.length} repositories across ${CATEGORIES.length} categories.`}
      />

      {/* Controls */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all projects…"
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

      {/* Category filter chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Chip
          active={activeCategory === null}
          onClick={() => setActiveCategory(null)}
          label={`All (${PROJECTS.length})`}
        />
        {CATEGORIES.map((c) => {
          const count = PROJECTS.filter((p) => p.category === c.name).length;
          return (
            <Chip
              key={c.slug}
              active={activeCategory === c.name}
              onClick={() => setActiveCategory(activeCategory === c.name ? null : c.name)}
              label={`${c.name} (${count})`}
            />
          );
        })}
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p, i) => (
          <ProjectCard key={`${p.owner}/${p.repo}`} project={p} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-fg-muted">
          No projects match your search.
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-border bg-bg-elevated text-fg-secondary hover:border-border-hover hover:text-fg",
      )}
    >
      {label}
    </button>
  );
}
