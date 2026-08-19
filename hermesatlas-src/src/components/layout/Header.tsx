import { Link, useLocation } from "react-router";
import { Search, Github, Star } from "lucide-react";
import { useState } from "react";
import { useSearch } from "@/lib/search";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "map", href: "/" },
  { label: "lists", href: "/projects" },
  { label: "categories", href: "/#categories" },
  { label: "about", href: "/#about" },
];

export function Header() {
  const { pathname } = useLocation();
  const { query, setQuery } = useSearch();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 font-mono text-sm font-bold">
          <span className="text-accent">hermes</span>
          <span className="text-fg">atlas</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                pathname === item.href
                  ? "bg-bg-elevated text-fg"
                  : "text-fg-secondary hover:bg-bg-elevated hover:text-fg",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-fg-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search projects…"
              className="w-48 rounded-lg border border-border bg-bg-elevated py-1.5 pl-8 pr-3 text-sm text-fg placeholder:text-fg-muted focus:border-border-hover focus:outline-none lg:w-64"
            />
          </div>

          <a
            href="https://github.com/ksimback/hermes-ecosystem"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-bg-elevated px-3 py-1.5 text-sm text-fg-secondary transition-colors hover:border-border-hover hover:text-fg"
          >
            <Github className="size-3.5" />
            <span className="hidden lg:inline">star</span>
            <Star className="size-3 text-accent-amber" />
          </a>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-border bg-bg-elevated p-1.5 text-fg-secondary md:hidden"
            aria-label="Toggle menu"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-border bg-bg px-4 py-2 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMenuOpen(false)}
              className="block rounded-md px-3 py-2 text-sm text-fg-secondary hover:bg-bg-elevated hover:text-fg"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
