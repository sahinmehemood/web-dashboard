import { motion } from "framer-motion";
import { PROJECTS, CATEGORIES } from "@/data/projects";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";

export function Hero() {
  const totalStars = PROJECTS.reduce((sum, p) => sum + p.stars, 0);
  const totalRepos = PROJECTS.length;
  const totalCategories = CATEGORIES.length;
  const officialCount = PROJECTS.filter((p) => p.official).length;

  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <div className="section-prefix mb-4">// community map of hermes agent</div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            The open-source
            <br />
            <span className="text-fg-secondary">Hermes Agent</span> ecosystem
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-fg-secondary">
            <strong className="text-fg">
              <AnimatedCounter value={totalRepos} />
            </strong>{" "}
            community-built tools, skills, plugins, and integrations — quality
            filtered, security reviewed, curated weekly.
          </p>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatBox value={totalStars} label="total stars" isStars />
            <StatBox value={totalRepos} label="repos" />
            <StatBox value={totalCategories} label="categories" />
            <StatBox value={officialCount} label="official" />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#categories"
              className="rounded-lg bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90"
            >
              Explore categories →
            </a>
            <a
              href="https://github.com/NousResearch/hermes-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border bg-bg-elevated px-5 py-2.5 text-sm font-medium text-fg transition-colors hover:border-border-hover"
            >
              View core agent
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StatBox({
  value,
  label,
  isStars,
}: {
  value: number;
  label: string;
  isStars?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-4">
      <div className="text-2xl font-bold tabular-nums md:text-3xl">
        {isStars ? (
          <AnimatedCounter value={value} />
        ) : (
          <AnimatedCounter value={value} />
        )}
      </div>
      <div className="mt-1 text-xs text-fg-muted">{label}</div>
    </div>
  );
}
