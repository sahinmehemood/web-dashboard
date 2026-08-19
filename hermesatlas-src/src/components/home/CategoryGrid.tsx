import { Link } from "react-router";
import { motion } from "framer-motion";
import { CATEGORIES, getProjectsByCategory } from "@/data/projects";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { cn } from "@/lib/utils";

export function CategoryGrid() {
  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <SectionHeader
        index="01"
        title="Browse by category"
        description="The ecosystem organized by what a project is — not what you're trying to build."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat, i) => {
          const count = getProjectsByCategory(cat.name).length;
          return (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
            >
              <Link
                to={`/category/${cat.slug}`}
                className={cn(
                  "group flex h-full flex-col rounded-xl border border-border bg-bg-elevated p-5 transition-all hover:border-border-hover hover:bg-bg-hover",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="section-prefix">§{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-xs text-fg-muted">{count} repos</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">
                  {cat.name}
                </h3>
                <p className="mt-1 flex-1 text-sm text-fg-secondary">
                  {cat.description}
                </p>
                <div className="mt-3 flex items-center gap-1 text-sm text-accent opacity-0 transition-opacity group-hover:opacity-100">
                  View projects →
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
