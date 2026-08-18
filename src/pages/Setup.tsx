import { motion } from "framer-motion";
import { ArrowRight, Copy, Check, Terminal, Smartphone, Cloud, Activity, Zap } from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useCallback } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function CopyBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      const ta = document.createElement("textarea");
      ta.value = code;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  return (
    <div className="relative group">
      {label && (
        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
          {label}
        </div>
      )}
      <div className="flex items-center gap-2 rounded-lg bg-secondary border border-border p-3 font-mono text-sm">
        <code className="flex-1 overflow-x-auto whitespace-nowrap text-foreground">{code}</code>
        <button
          onClick={handleCopy}
          className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
          aria-label="Copy to clipboard"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  description,
  children,
  index,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeUp}
      className="border-b border-border/60 py-10"
    >
      <div className="flex gap-6 items-start">
        <span className="text-xs font-mono text-muted-foreground/50 mt-1 shrink-0 w-6">
          {number}
        </span>
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </motion.div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Terminal;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}

export default function Setup() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background text-foreground"
    >
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="mx-auto max-w-3xl flex items-center justify-between h-14 px-6">
          <button
            onClick={() => navigate("/")}
            className="text-sm font-semibold tracking-tight hover:opacity-70 transition-opacity cursor-pointer"
          >
            hermes
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/setup")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Setup
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="text-sm font-medium bg-foreground text-background px-4 py-1.5 rounded hover:bg-foreground/90 transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-24 pb-32 px-6">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-16"
          >
            <div className="h-px w-8 bg-foreground mb-6" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
              Connect your
              <br />
              <span className="text-muted-foreground">Termux device.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
              Install the monitoring agent on your Android device. It collects
              telemetry, checks model health, and sends everything to your
              dashboard in real time.
            </p>
          </motion.div>

          {/* Prerequisites */}
          <motion.div
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-12"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Prerequisites
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoCard icon={Smartphone} title="Android device">
                A phone or tablet with{" "}
                <a
                  href="https://f-droid.org/en/packages/com.termux/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  Termux
                </a>{" "}
                installed from F-Droid (not Play Store).
              </InfoCard>
              <InfoCard icon={Terminal} title="Termux:API">
                Install{" "}
                <code className="text-xs bg-secondary px-1 py-0.5 rounded">
                  termux-api
                </code>{" "}
                for battery and device info. Available on F-Droid.
              </InfoCard>
              <InfoCard icon={Cloud} title="Convex account">
                Free at{" "}
                <a
                  href="https://convex.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  convex.dev
                </a>
                . This dashboard uses it as the backend — no server needed.
              </InfoCard>
              <InfoCard icon={Zap} title="jq + curl">
                JSON parser and HTTP client. Installed automatically by the
                setup script.
              </InfoCard>
            </div>
          </motion.div>

          {/* Divider */}
          <div className="border-t border-border/60" />

          {/* Steps */}
          <div>
            <Step number="01" title="Open Termux" description="Launch Termux on your Android device." index={2}>
              <p className="text-sm text-muted-foreground">
                If this is your first time, run{" "}
                <code className="text-xs bg-secondary px-1 py-0.5 rounded">
                  pkg update && pkg upgrade
                </code>{" "}
                to get the latest packages.
              </p>
            </Step>

            <Step
              number="02"
              title="Install dependencies"
              description="The setup script installs jq, curl, and the Termux API automatically."
              index={3}
            >
              <CopyBlock
                label="Run this first"
                code="pkg install -y jq curl termux-api"
              />
            </Step>

            <Step
              number="03"
              title="Set your Convex URL"
              description="Copy your Convex deployment URL from the dashboard settings or your project dashboard."
              index={4}
            >
              <CopyBlock
                label="Replace with your actual URL"
                code='export CONVEX_URL="https://your-deployment.convex.cloud"'
              />
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
                  <strong>Where to find it:</strong> Go to{" "}
                  <a
                    href="https://dashboard.convex.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    dashboard.convex.dev
                  </a>{" "}
                  → your project → Settings → Deployment URL. It looks like{" "}
                  <code className="text-[11px] bg-amber-500/10 px-1 py-0.5 rounded">
                    https://xxx.convex.cloud
                  </code>
                </p>
              </div>
            </Step>

            <Step
              number="04"
              title="Download and run the setup script"
              description="This installs the monitoring agent, collector scripts, and command poller into ~/.hermes-dashboard/."
              index={5}
            >
              <CopyBlock
                label="One command setup"
                code='curl -fsSL https://raw.githubusercontent.com/your-repo/main/scripts/hermes-dashboard-setup.sh | bash'
              />
              <p className="text-sm text-muted-foreground">
                Or if you have the script locally:
              </p>
              <CopyBlock code="bash hermes-dashboard-setup.sh" />
            </Step>

            <Step
              number="05"
              title="Start the agent"
              description="The agent runs in the background, sending telemetry every 30 seconds and checking model health every 5 minutes."
              index={6}
            >
              <CopyBlock
                label="Start everything"
                code="bash ~/.hermes-dashboard/start.sh"
              />
              <p className="text-sm text-muted-foreground">
                To run it persistently (survives Termux closing):
              </p>
              <CopyBlock
                label="Auto-start on boot"
                code="termux-wake-lock && bash ~/.hermes-dashboard/agent-loop.sh &"
              />
            </Step>

            <Step
              number="06"
              title="Verify the connection"
              description="Open the dashboard — the 'Demo' badge should disappear and live data should appear."
              index={7}
            >
              <div className="space-y-3">
                <InfoCard icon={Activity} title="Check it's working">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Open this dashboard and sign in</li>
                    <li>
                      Look at the header — if you see <strong>7/7 services</strong> and no "Demo" badge, it's live
                    </li>
                    <li>
                      Check the <strong>Overview</strong> tab for real battery, CPU, and memory stats
                    </li>
                  </ol>
                </InfoCard>
                <InfoCard icon={Terminal} title="Manual test">
                  <p>
                    You can also test the API directly from Termux:
                  </p>
                  <CopyBlock code={"curl -X POST " + "$CONVEX_URL/api/telemetry" + " -H 'Content-Type: application/json' -d '{\"deviceId\":\"hermes-primary\",\"batteryPercent\":50,\"batteryStatus\":\"Discharging\",\"cpuUsagePercent\":10,\"cpuCores\":8,\"memUsedMb\":1000,\"memTotalMb\":4000,\"storageUsedGb\":20,\"storageTotalGb\":64,\"uptimeSeconds\":1000,\"loadAvg1\":0.5,\"loadAvg5\":0.3,\"loadAvg15\":0.2,\"networkOnline\":true}'"} />
                </InfoCard>
              </div>
            </Step>
          </div>

          {/* Divider */}
          <div className="border-t border-border/60" />

          {/* What gets installed */}
          <motion.div
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="py-12"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8">
              What gets installed
            </p>
            <div className="rounded-xl border border-border bg-card p-5">
              <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
{`~/.hermes-dashboard/
├── collect-device.sh      ← Battery, CPU, RAM, storage → POST /api/telemetry
├── check-models.sh        ← Provider health checks → POST /api/providers
├── poll-commands.sh       ← GET /api/commands → execute → POST /api/command-result
├── log-activity.sh        ← Called from Hermes hooks → POST /api/activity
├── collect-crown.sh       ← Crown (runit) status → POST /api/crown-health
├── collect-brain.sh       ← NOUS vault stats → POST /api/brain-stats
├── collect-bots.sh        ← Telegram bot inventory → POST /api/telegram-bots
├── agent-loop.sh          ← Orchestrator — runs everything on schedule
├── config.json            ← Your device ID, Convex URL, intervals
└── start.sh               ← One command to start everything`}
              </pre>
            </div>
          </motion.div>

          {/* API endpoints reference */}
          <motion.div
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="pb-12"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8">
              API endpoints
            </p>
            <div className="space-y-2">
              {[
                { method: "POST", path: "/api/telemetry", desc: "Device stats (battery, CPU, RAM, storage)" },
                { method: "POST", path: "/api/crown-health", desc: "Crown (runit) service status" },
                { method: "POST", path: "/api/providers", desc: "API provider health + model latency" },
                { method: "POST", path: "/api/crons", desc: "Cron job status + run history" },
                { method: "POST", path: "/api/brain-stats", desc: "NOUS vault statistics" },
                { method: "POST", path: "/api/activity", desc: "Agent activity events" },
                { method: "GET", path: "/api/commands", desc: "Pending remote commands (polled by Termux)" },
                { method: "POST", path: "/api/command-result", desc: "Command execution results" },
              ].map((ep) => (
                <div
                  key={ep.path}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5"
                >
                  <span
                    className={
                      "text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded shrink-0 " +
                      (ep.method === "GET"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400")
                    }
                  >
                    {ep.method}
                  </span>
                  <code className="text-xs font-mono text-foreground shrink-0">{ep.path}</code>
                  <span className="text-xs text-muted-foreground hidden sm:inline">— {ep.desc}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center pt-8"
          >
            <button
              onClick={() => navigate("/auth")}
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-sm font-medium rounded hover:bg-foreground/90 transition-colors"
            >
              Open Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-3xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-semibold tracking-tight">hermes</span>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Hermes Command Dashboard. All rights reserved.
          </p>
        </div>
      </footer>
    </motion.div>
  );
}
