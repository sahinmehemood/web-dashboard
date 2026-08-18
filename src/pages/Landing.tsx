import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Bot,
  GitBranch,
  Minus,
  ShieldCheck,
  Terminal,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.svg";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease },
  }),
};

const FEATURES: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: Activity,
    title: "Device telemetry",
    description:
      "Real-time battery, CPU, memory, storage, and network stats from your Termux device — refreshed every 30 seconds.",
  },
  {
    icon: Zap,
    title: "Model health",
    description:
      "See which AI models are healthy, on cooldown, or rate-limited. Track latency and status per provider.",
  },
  {
    icon: Terminal,
    title: "Remote commands",
    description:
      "Dispatch commands to your Hermes agent from the web — restart, run skills, or send custom payloads.",
  },
  {
    icon: GitBranch,
    title: "Activity feed",
    description:
      "A live log of every message handled, skill triggered, error thrown, and webhook received by your agent.",
  },
  {
    icon: Bot,
    title: "Telegram Mini App",
    description:
      "Add the dashboard as a Mini App in your bot and monitor your agent without leaving the chat.",
  },
  {
    icon: ShieldCheck,
    title: "Minimal by design",
    description:
      "A precise, near-monochrome interface. Every pixel is intentional — no charts for charts' sake.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Install the Termux script",
    detail:
      "One command installs the monitoring agent on your device.",
  },
  {
    step: "02",
    title: "It streams to Convex",
    detail:
      "Telemetry, model health, and activity logs flow to your dashboard in real time.",
  },
  {
    step: "03",
    title: "Monitor from anywhere",
    detail:
      "Open the web dashboard or add it to your Telegram bot as a Mini App.",
  },
];

const STATS = [
  { value: "30s", label: "telemetry cadence" },
  { value: "7", label: "supervised services" },
  { value: "5m", label: "model health checks" },
  { value: "3", label: "bot channels" },
];

function Navbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <button
          onClick={() => navigate("/")}
          className="flex cursor-pointer items-center gap-2"
          aria-label="Hermes home"
        >
          <img src={logo} alt="" width={24} height={24} className="rounded-md" />
          <span className="text-sm font-semibold tracking-tight">hermes</span>
        </button>

        <div className="flex items-center gap-1 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/setup")}
            className="text-muted-foreground"
          >
            Setup
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <SunIcon />
            ) : (
              <MoonIcon />
            )}
          </Button>
          <Button size="sm" onClick={() => navigate("/auth")}>
            Open dashboard
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function HeroPreview() {
  return (
    <div className="relative mx-auto mt-16 w-full max-w-3xl">
      <div
        aria-hidden
        className="absolute -inset-x-8 -top-8 -bottom-16 -z-10 rounded-[2rem] bg-gradient-to-b from-foreground/[0.04] to-transparent"
      />
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
          <span className="size-2.5 rounded-full bg-muted-foreground/20" />
          <span className="size-2.5 rounded-full bg-muted-foreground/20" />
          <span className="size-2.5 rounded-full bg-muted-foreground/20" />
          <span className="ml-3 rounded-md bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            dashboard.hermes.dev/overview
          </span>
        </div>
        <div className="grid grid-cols-[44px_1fr]">
          <div className="space-y-1 border-r border-border p-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-2.5 rounded-sm",
                  i === 0 ? "bg-foreground/70" : "bg-muted",
                )}
              />
            ))}
          </div>
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 rounded-sm bg-muted" />
              <div className="h-3 w-14 rounded-full bg-emerald-500/15" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { v: "87%", l: "battery", dot: "bg-emerald-500" },
                { v: "12%", l: "cpu", dot: "bg-blue-500" },
                { v: "32%", l: "memory", dot: "bg-violet-500" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-1.5">
                    <span className={cn("size-1.5 rounded-full", s.dot)} />
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                      {s.l}
                    </span>
                  </div>
                  <div className="mt-1.5 text-lg font-bold tracking-tight">
                    {s.v}
                  </div>
                  <div className="mt-1.5 h-1 rounded-full bg-secondary">
                    <div
                      className={cn("h-full rounded-full", s.dot)}
                      style={{
                        width: s.v,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              {[
                { n: "bot", s: "run", t: "3d 14h" },
                { n: "search", s: "run", t: "3d 14h" },
                { n: "web", s: "run", t: "2d 8h" },
              ].map((svc) => (
                <div
                  key={svc.n}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    <span className="font-mono text-[11px]">{svc.n}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {svc.s} · {svc.t}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const ctaLabel = isAuthenticated ? "Open dashboard" : "Get started";
  const ctaTarget = isAuthenticated ? "/dashboard" : "/auth";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background text-foreground"
    >
      <Navbar />

      {/* Hero */}
      <section className="px-5 pt-32 pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Minus className="size-3" />
              Command dashboard for Hermes
            </span>
          </motion.div>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl"
          >
            See everything.
            <br />
            <span className="text-muted-foreground">Control anything.</span>
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            A real-time command dashboard for your Hermes agent. Monitor device
            health, track model performance, and send remote commands — all from
            one clean interface.
          </motion.p>

          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-9 flex items-center justify-center gap-3"
          >
            <Button
              size="lg"
              onClick={() => navigate(ctaTarget)}
              className="gap-2"
            >
              {ctaLabel}
              <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/setup")}>
              Set up my device
            </Button>
          </motion.div>

          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <HeroPreview />
          </motion.div>
        </div>
      </section>

      {/* Stats band */}
      <section className="border-y border-border/60">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-5 py-12 sm:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              className="text-center"
            >
              <div className="text-3xl font-bold tracking-tight">
                {stat.value}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.p
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="mb-12 text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            What you get
          </motion.p>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                className="group bg-card p-6 transition-colors hover:bg-muted/40"
              >
                <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-background">
                  <feature.icon className="size-4 text-muted-foreground" />
                </span>
                <h3 className="mt-4 text-base font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-5 pb-24">
        <div className="mx-auto max-w-3xl">
          <motion.p
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="mb-12 text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            How it works
          </motion.p>
          <div>
            {STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeUp}
                className="flex items-start gap-6 border-b border-border/60 py-8"
              >
                <span className="mt-1 shrink-0 font-mono text-xs text-muted-foreground/60">
                  {s.step}
                </span>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {s.detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 px-5 py-28">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
          >
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live from your device
            </span>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Your agent, under
              <br />
              <span className="text-muted-foreground">your control.</span>
            </h2>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button size="lg" onClick={() => navigate(ctaTarget)}>
                {ctaLabel}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
          <span className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <img src={logo} alt="" width={20} height={20} className="rounded" />
            hermes
          </span>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Hermes Command Dashboard. All rights
            reserved.
          </p>
        </div>
      </footer>
    </motion.div>
  );
}