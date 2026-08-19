import { useSearch } from "@/lib/search";
import { ProjectCard } from "@/components/project/ProjectCard";
import { SectionHeader } from "@/components/shared/SectionHeader";

export function SearchResults() {
  const { query, results, isSearching } = useSearch();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <SectionHeader
        index="search"
        title={isSearching ? `Results for "${query}"` : "Search"}
        description={
          isSearching
            ? `${results.length} project${results.length === 1 ? "" : "s"} found`
            : "Type in the search box above to find projects."
        }
      />

      {isSearching && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((p, i) => (
            <ProjectCard key={`${p.owner}/${p.repo}`} project={p} index={i} />
          ))}
        </div>
      )}

      {isSearching && results.length === 0 && (
        <div className="py-12 text-center text-fg-muted">
          No projects found for "{query}".
        </div>
      )}
    </div>
  );
}
