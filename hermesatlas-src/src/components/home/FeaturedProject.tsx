import { motion } from "framer-motion";
import { Github, Star, GitFork, Tag } from "lucide-react";
import { getProject } from "@/data/projects";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Badge } from "@/components/shared/Badge";
import { formatStars } from "@/lib/utils";

export function FeaturedProject() {
  const featured = getProject("NousResearch", "hermes-agent");
  if (!featured) return null;

  const stats = [
    { label: "stars", value: "232.9K", icon: Star, tone: "text-accent-amber" },
    { label: "forks", value: "39K", icon: GitFork },
    { label: "built-in tools", value: "47", icon: Tag },
    { label: "platforms", value: "16", icon: Tag },
    { label: "llm providers", value: "20+", icon: Tag },
    { label: "backends", value: "6", icon: Tag },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <SectionHeader
        index="02"
        title="Featured project"
        description="The core agent that started it all."
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border border-border bg-bg-elevated p-6 md:p-8"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="success">official</Badge>
              <span className="section-prefix">core & official</span>
            </div>
            <h3 className="mt-3 flex items-center gap-2 font-mono text-2xl font-bold">
              <span className="text-fg-muted">{featured.owner}</span>
              <span className="text-fg">/</span>
              <span className="text-accent">{featured.repo}</span>
            </h3>
            <p className="mt-3 max-w-2xl text-fg-secondary">
              {featured.description}
            </p>
            <a
              href={featured.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-bg px-4 py-2 text-sm font-medium text-fg transition-colors hover:border-border-hover"
            >
              <Github className="size-4" />
              View on GitHub
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:w-auto">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border bg-bg p-4 text-center"
              >
                <div className="text-xl font-bold tabular-nums md:text-2xl">
                  {s.value}
                </div>
                <div className="mt-1 flex items-center justify-center gap-1 text-[11px] text-fg-muted">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
