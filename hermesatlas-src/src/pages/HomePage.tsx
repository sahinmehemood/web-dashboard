import { Hero } from "@/components/home/Hero";
import { FeaturedProject } from "@/components/home/FeaturedProject";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { PROJECTS } from "@/data/projects";
import { ProjectCard } from "@/components/project/ProjectCard";
import { SectionHeader } from "@/components/shared/SectionHeader";

export function HomePage() {
  const topProjects = [...PROJECTS]
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 12);

  return (
    <div className="flex-1">
      <Hero />
      <FeaturedProject />
      <CategoryGrid />

      {/* Top projects */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <SectionHeader
          index="03"
          title="Most starred projects"
          description="The community's favorite tools and integrations."
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {topProjects.map((p, i) => (
            <ProjectCard key={`${p.owner}/${p.repo}`} project={p} index={i} />
          ))}
        </div>
      </section>

      {/* Newsletter / About */}
      <section id="about" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <SectionHeader
          index="04"
          title="About Hermes Atlas"
          description="A community-driven catalog of the Hermes Agent ecosystem."
        />
        <div className="rounded-2xl border border-border bg-bg-elevated p-6 md:p-8">
          <p className="max-w-3xl text-fg-secondary">
            Hermes Atlas is an independent, community-run project that catalogs
            the open-source ecosystem around{" "}
            <a
              href="https://github.com/NousResearch/hermes-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Nous Research's Hermes Agent
            </a>
            . We track{" "}
            <strong className="text-fg">{PROJECTS.length}+</strong> repositories
            across {12} categories — from official tooling to community plugins,
            skills, and memory providers. Data is sourced from the{" "}
            <a
              href="https://github.com/ksimback/hermes-ecosystem"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              hermes-ecosystem
            </a>{" "}
            repository and refreshed weekly.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="https://github.com/ksimback/hermes-ecosystem"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border bg-bg px-4 py-2 text-sm font-medium text-fg transition-colors hover:border-border-hover"
            >
              Contribute on GitHub →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
