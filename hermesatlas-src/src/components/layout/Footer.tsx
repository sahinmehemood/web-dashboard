import { Link } from "react-router";
import { Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="font-mono text-sm font-bold">
              <span className="text-accent">hermes</span>
              <span className="text-fg">atlas</span>
            </div>
            <p className="mt-2 text-sm text-fg-secondary">
              The community map of Hermes Agent — open-source tools, skills,
              plugins, and integrations.
            </p>
          </div>

          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-fg-muted">
              Explore
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-fg-secondary hover:text-fg">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-fg-secondary hover:text-fg">
                  All projects
                </Link>
              </li>
              <li>
                <Link to="/#categories" className="text-fg-secondary hover:text-fg">
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-fg-muted">
              Resources
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://hermes-agent.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fg-secondary hover:text-fg"
                >
                  Hermes Agent
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/NousResearch/hermes-agent"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fg-secondary hover:text-fg"
                >
                  Official repo
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/ksimback/hermes-ecosystem"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fg-secondary hover:text-fg"
                >
                  Source data
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-fg-muted">
              Connect
            </div>
            <div className="flex gap-2">
              <a
                href="https://github.com/ksimback/hermes-ecosystem"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border bg-bg-elevated p-2 text-fg-secondary transition-colors hover:border-border-hover hover:text-fg"
                aria-label="GitHub"
              >
                <Github className="size-4" />
              </a>
              <a
                href="https://x.com/ksimback"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border bg-bg-elevated p-2 text-fg-secondary transition-colors hover:border-border-hover hover:text-fg"
                aria-label="Twitter"
              >
                <Twitter className="size-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-fg-muted">
          © {new Date().getFullYear()} Hermes Atlas. Community project — not
          affiliated with Nous Research.
        </div>
      </div>
    </footer>
  );
}
