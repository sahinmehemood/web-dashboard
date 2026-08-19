export const DID = "hermes-primary";

export interface DeviceTelemetry {
  deviceId: string;
  hostname?: string;
  batteryPercent: number;
  batteryStatus: string;
  cpuUsagePercent: number;
  cpuCores: number;
  memUsedMb: number;
  memTotalMb: number;
  storageUsedGb: number;
  storageTotalGb: number;
  uptimeSeconds: number;
  loadAvg1: number;
  loadAvg5: number;
  loadAvg15: number;
  networkOnline: boolean;
}

export interface CrownService {
  name: string;
  status: string;
  pid?: number;
  uptime?: string;
  memoryMb?: number;
  cpuPercent?: number;
  restartCount?: number;
  logTail?: string[];
}

export interface CrownHealth {
  deviceId: string;
  crownStatus: string;
  runsvdirCount: number;
  services: CrownService[];
  orphans: number;
}

export interface ProviderModel {
  name: string;
  isDefault?: boolean;
  lastLatencyMs?: number;
  status?: string;
  lastChecked?: number;
}

export interface ApiProvider {
  name: string;
  displayName: string;
  enabled: boolean;
  baseUrl?: string;
  models: ProviderModel[];
  failureReason?: string;
  lastChecked: number;
}

export interface CronJob {
  deviceId: string;
  jobId: string;
  name: string;
  schedule: string;
  kind: string;
  enabled: boolean;
  state: string;
  lastStatus?: string;
  lastError?: string;
  lastRunAt?: number;
  nextRunAt?: number;
  completedCount: number;
  noAgent: boolean;
}

export interface BrainStats {
  deviceId: string;
  totalNotes: number;
  wikiPages: number;
  sources: number;
  inboxItems: number;
  dailyNotes: number;
  sessionLogs: number;
  lastGitSyncAt?: number;
  lastIngestAt?: number;
}

export interface TelegramBot {
  deviceId: string;
  botId: string;
  username: string;
  role: string;
  status: string;
  apiPort?: number;
  hermesHome?: string;
  messagesHandled?: number;
  errorsToday?: number;
  lastSeenAt?: number;
  avgResponseMs?: number;
}

export interface AgentInstance {
  deviceId: string;
  agentId: string;
  name: string;
  state: "active" | "idle" | "crashed";
  connectedBot: string;
  servicePid?: number;
  uptimeSeconds: number;
  messagesHandled: number;
  lastActiveAt: number;
  memoryMb: number;
  cpuPercent: number;
}

export type ActivityLevel = "info" | "success" | "warning" | "error";

export interface ActivityEvent {
  deviceId: string;
  activityType: string;
  title: string;
  detail?: string;
  timestamp: number;
  level: ActivityLevel;
}

export interface DeviceIdentity {
  deviceId: string;
  hostname: string;
  os: string;
  arch: string;
  kernel: string;
  termuxVersion: string;
  model: string;
  androidVersion: string;
  installedAt: number;
  version: string;
}

export const DDEV: DeviceIdentity = {
  deviceId: DID,
  hostname: "Pixel-7-Termux",
  os: "Android 14",
  arch: "aarch64",
  kernel: "5.10.107-android13-4-00001",
  termuxVersion: "0.118.2",
  model: "Pixel 7",
  androidVersion: "14",
  installedAt: Date.now() - 1000 * 60 * 60 * 24 * 214,
  version: "1.4.0",
};

export const APP_VERSION = "1.4.0";

export const DT: DeviceTelemetry = {
  deviceId: DID,
  batteryPercent: 87,
  batteryStatus: "Charging",
  cpuUsagePercent: 12,
  cpuCores: 8,
  memUsedMb: 1847,
  memTotalMb: 5731,
  storageUsedGb: 38.2,
  storageTotalGb: 108.4,
  uptimeSeconds: 302400,
  loadAvg1: 1.2,
  loadAvg5: 0.9,
  loadAvg15: 0.7,
  networkOnline: true,
  hostname: "Pixel-7-Termux",
};

export const DC: CrownHealth = {
  deviceId: DID,
  crownStatus: "GREEN",
  runsvdirCount: 1,
  orphans: 0,
  services: [
    { name: "bot", status: "run", pid: 25899, uptime: "3d 14h", memoryMb: 186, cpuPercent: 2.1, restartCount: 1, logTail: ["[INFO] Gateway session active", "[INFO] Processing message from chat 8387179252", "[INFO] Model router: tencent/hy3:free (kilocode)"] },
    { name: "bot2", status: "run", pid: 26104, uptime: "3d 14h", memoryMb: 142, cpuPercent: 0.8, restartCount: 0, logTail: ["[INFO] Second gateway listening on :8643", "[INFO] Session idle, awaiting messages"] },
    { name: "web", status: "run", pid: 26210, uptime: "3d 14h", memoryMb: 234, cpuPercent: 1.4, restartCount: 0, logTail: ["[INFO] Dashboard serving on :9119", "[INFO] 12 active WebSocket connections"] },
    { name: "search", status: "run", pid: 26300, uptime: "3d 14h", memoryMb: 312, cpuPercent: 3.2, restartCount: 2, logTail: ["[INFO] SearXNG ready on :8888", "[INFO] Query cache: 847 entries"] },
    { name: "tunnel", status: "run", pid: 26400, uptime: "2d 8h", memoryMb: 28, cpuPercent: 0.1, restartCount: 3, logTail: ["[INFO] Serveo tunnel established", "[INFO] Forwarding localhost:9119 → serveo.net"] },
    { name: "proxy", status: "run", pid: 26500, uptime: "3d 14h", memoryMb: 45, cpuPercent: 0.3, restartCount: 0, logTail: ["[INFO] Dashboard proxy :9120 → :9119", "[INFO] SSL termination active"] },
    { name: "scraper", status: "run", pid: 26600, uptime: "3d 14h", memoryMb: 178, cpuPercent: 1.7, restartCount: 1, logTail: ["[INFO] Scraper service on :8777", "[INFO] Queue: 0 pending, 142 completed today"] },
  ],
};

export const DP: ApiProvider[] = [
  {
    name: "kilocode",
    displayName: "Kilocode",
    enabled: true,
    baseUrl: "https://api.kilo.ai/api/gateway",
    lastChecked: Date.now(),
    models: [
      {
        name: "tencent/hy3:free",
        isDefault: true,
        lastLatencyMs: 892,
        status: "healthy",
      },
    ],
  },
  {
    name: "openrouter",
    displayName: "OpenRouter",
    enabled: true,
    baseUrl: "https://openrouter.ai/api/v1",
    lastChecked: Date.now(),
    models: [
      {
        name: "nemotron-3-ultra-550b:free",
        lastLatencyMs: 1200,
        status: "healthy",
      },
      {
        name: "nemotron-3-super-120b:free",
        lastLatencyMs: 680,
        status: "healthy",
      },
    ],
  },
  {
    name: "nvidia",
    displayName: "NVIDIA",
    enabled: true,
    lastChecked: Date.now(),
    failureReason: "rate_limit",
    models: [
      {
        name: "nemotron-3-nano-omni-30b:free",
        lastLatencyMs: 1450,
        status: "rate_limited",
      },
    ],
  },
  {
    name: "opencode-zen",
    displayName: "OpenCode Zen",
    enabled: true,
    baseUrl: "https://opencode.ai/zen/v1",
    lastChecked: Date.now(),
    models: [
      { name: "mimo-v2.5-free", lastLatencyMs: 430, status: "healthy" },
      { name: "laguna-s-2.1-free", lastLatencyMs: 320, status: "healthy" },
      {
        name: "nemotron-3.5-lightning-free",
        lastLatencyMs: 380,
        status: "healthy",
      },
    ],
  },
  {
    name: "zai",
    displayName: "Z.AI (GLM)",
    enabled: true,
    lastChecked: Date.now(),
    failureReason: "rate_limit",
    models: [{ name: "GLM-4.7-Flash", status: "cooldown" }],
  },
  {
    name: "gemini",
    displayName: "Google Gemini",
    enabled: true,
    lastChecked: Date.now(),
    failureReason: "rate_limit",
    models: [{ name: "gemini-1.5-flash", status: "rate_limited" }],
  },
  {
    name: "ollama",
    displayName: "Ollama Cloud",
    enabled: true,
    lastChecked: Date.now(),
    failureReason: "auth",
    models: [{ name: "llama-3.1-8b", status: "error" }],
  },
];

export const DCR: CronJob[] = [
  {
    deviceId: DID,
    jobId: "gov",
    name: "gov",
    schedule: "*/5 * * * *",
    kind: "cron",
    enabled: true,
    state: "scheduled",
    lastStatus: "ok",
    completedCount: 462,
    noAgent: true,
    lastRunAt: Date.now() - 120000,
    nextRunAt: Date.now() + 180000,
  },
  {
    deviceId: DID,
    jobId: "health",
    name: "health",
    schedule: "*/15 * * * *",
    kind: "cron",
    enabled: true,
    state: "scheduled",
    lastStatus: "ok",
    completedCount: 145,
    noAgent: true,
    lastRunAt: Date.now() - 600000,
    nextRunAt: Date.now() + 300000,
  },
  {
    deviceId: DID,
    jobId: "brain-git",
    name: "brain-git",
    schedule: "*/30 * * * *",
    kind: "cron",
    enabled: true,
    state: "scheduled",
    lastStatus: "ok",
    completedCount: 98,
    noAgent: true,
    lastRunAt: Date.now() - 900000,
    nextRunAt: Date.now() + 900000,
  },
  {
    deviceId: DID,
    jobId: "brain-autosave",
    name: "brain-autosave",
    schedule: "every 120m",
    kind: "interval",
    enabled: true,
    state: "scheduled",
    lastStatus: "ok",
    completedCount: 27,
    noAgent: true,
    lastRunAt: Date.now() - 3600000,
    nextRunAt: Date.now() + 7200000,
  },
  {
    deviceId: DID,
    jobId: "brain-ingest",
    name: "brain-ingest",
    schedule: "0 23 * * *",
    kind: "cron",
    enabled: true,
    state: "scheduled",
    lastStatus: "ok",
    completedCount: 4,
    noAgent: true,
    lastRunAt: Date.now() - 43200000,
    nextRunAt: Date.now() + 43200000,
  },
  {
    deviceId: DID,
    jobId: "brain-safety-net",
    name: "brain-safety-net",
    schedule: "30 23 * * *",
    kind: "cron",
    enabled: true,
    state: "scheduled",
    lastStatus: "ok",
    completedCount: 3,
    noAgent: true,
    lastRunAt: Date.now() - 43200000,
    nextRunAt: Date.now() + 43200000,
  },
];

export const DBR: BrainStats = {
  deviceId: DID,
  totalNotes: 247,
  wikiPages: 34,
  sources: 52,
  inboxItems: 3,
  dailyNotes: 8,
  sessionLogs: 12,
  lastGitSyncAt: Date.now() - 1800000,
  lastIngestAt: Date.now() - 43200000,
};

export const DBT: TelegramBot[] = [
  {
    deviceId: DID,
    botId: "8901379552",
    username: "hermesthehdbot",
    role: "main_gateway",
    status: "live",
    apiPort: 8642,
    messagesHandled: 1847,
    errorsToday: 2,
    lastSeenAt: Date.now() - 60000,
    avgResponseMs: 1240,
  },
  {
    deviceId: DID,
    botId: "8800543516",
    username: "Hermesagenths_bot",
    role: "second_gateway",
    status: "live",
    apiPort: 8643,
    messagesHandled: 423,
    errorsToday: 0,
    lastSeenAt: Date.now() - 300000,
    avgResponseMs: 890,
  },
  {
    deviceId: DID,
    botId: "8455877806",
    username: "Alerts17bot",
    role: "alerts",
    status: "live",
    messagesHandled: 89,
    errorsToday: 0,
    lastSeenAt: Date.now() - 1800000,
    avgResponseMs: 320,
  },
  {
    deviceId: DID,
    botId: "8986342284",
    username: "Cristhehdbot",
    role: "legacy",
    status: "dead",
    messagesHandled: 0,
    errorsToday: 12,
    lastSeenAt: Date.now() - 86400000,
    avgResponseMs: 0,
  },
];

export const DAG: AgentInstance[] = [
  {
    deviceId: DID,
    agentId: "agent-main",
    name: "Main Agent",
    state: "active",
    connectedBot: "hermesthehdbot",
    servicePid: 25899,
    uptimeSeconds: 302400,
    messagesHandled: 1847,
    lastActiveAt: Date.now() - 60000,
    memoryMb: 186,
    cpuPercent: 2.1,
  },
  {
    deviceId: DID,
    agentId: "agent-secondary",
    name: "Secondary Agent",
    state: "idle",
    connectedBot: "Hermesagenths_bot",
    servicePid: 26104,
    uptimeSeconds: 302400,
    messagesHandled: 423,
    lastActiveAt: Date.now() - 300000,
    memoryMb: 142,
    cpuPercent: 0.8,
  },
  {
    deviceId: DID,
    agentId: "agent-alerts",
    name: "Alert Monitor",
    state: "active",
    connectedBot: "Alerts17bot",
    uptimeSeconds: 302400,
    messagesHandled: 89,
    lastActiveAt: Date.now() - 1800000,
    memoryMb: 64,
    cpuPercent: 0.3,
  },
  {
    deviceId: DID,
    agentId: "agent-legacy",
    name: "Legacy Agent",
    state: "crashed",
    connectedBot: "Cristhehdbot",
    uptimeSeconds: 0,
    messagesHandled: 0,
    lastActiveAt: Date.now() - 86400000,
    memoryMb: 0,
    cpuPercent: 0,
  },
];

export const DA: ActivityEvent[] = [
  {
    activityType: "skill_used",
    title: "brain-query",
    detail: "Queried wiki: Agent Vault Architecture",
    timestamp: Date.now() - 300000,
    level: "info",
    deviceId: DID,
  },
  {
    activityType: "message_handled",
    title: "Telegram message",
    detail: "Chat 8387179252 · main_gateway",
    timestamp: Date.now() - 600000,
    level: "info",
    deviceId: DID,
  },
  {
    activityType: "cron_fired",
    title: "StackGov-2",
    detail: "6/6 departments GREEN",
    timestamp: Date.now() - 900000,
    level: "success",
    deviceId: DID,
  },
  {
    activityType: "brain_write",
    title: "Daily Note",
    detail: "Auto-appended 3 lines",
    timestamp: Date.now() - 1800000,
    level: "info",
    deviceId: DID,
  },
  {
    activityType: "skill_used",
    title: "deep-research",
    detail: "Scouted 5 sources via SearXNG",
    timestamp: Date.now() - 3600000,
    level: "info",
    deviceId: DID,
  },
  {
    activityType: "command_executed",
    title: "crown.sh",
    detail: "1 runsvdir, 7/7 up, 0 orphans",
    timestamp: Date.now() - 5400000,
    level: "success",
    deviceId: DID,
  },
  {
    activityType: "error",
    title: "opencode-zen auth",
    detail: "API key expired, reissued",
    timestamp: Date.now() - 7200000,
    level: "error",
    deviceId: DID,
  },
  {
    activityType: "cron_fired",
    title: "brain-git",
    detail: "Pushed 12 vault changes",
    timestamp: Date.now() - 9000000,
    level: "success",
    deviceId: DID,
  },
  {
    activityType: "webhook",
    title: "Incoming webhook",
    detail: "source=github, repo=hermes-agent",
    timestamp: Date.now() - 10800000,
    level: "info",
    deviceId: DID,
  },
  {
    activityType: "provider_health",
    title: "Model health check",
    detail: "5/7 providers healthy",
    timestamp: Date.now() - 12600000,
    level: "warning",
    deviceId: DID,
  },
  {
    activityType: "brain_write",
    title: "Session log",
    detail: "Logged 214 min session",
    timestamp: Date.now() - 14400000,
    level: "info",
    deviceId: DID,
  },
  {
    activityType: "message_handled",
    title: "Telegram message",
    detail: "Chat 8387179252 · second_gateway",
    timestamp: Date.now() - 16200000,
    level: "info",
    deviceId: DID,
  },
  {
    activityType: "command_executed",
    title: "check-providers.sh",
    detail: "Reported 2 rate-limited models",
    timestamp: Date.now() - 18000000,
    level: "warning",
    deviceId: DID,
  },
  {
    activityType: "cron_fired",
    title: "health",
    detail: "Storage 35%, battery 87%",
    timestamp: Date.now() - 19800000,
    level: "success",
    deviceId: DID,
  },
  {
    activityType: "skill_used",
    title: "web-extract",
    detail: "Extracted 214 paragraphs from URL",
    timestamp: Date.now() - 21600000,
    level: "info",
    deviceId: DID,
  },
  {
    activityType: "error",
    title: "nvidia rate limit",
    detail: "HTTP 429, backing off 60s",
    timestamp: Date.now() - 23400000,
    level: "warning",
    deviceId: DID,
  },
  {
    activityType: "restart",
    title: "Hermes gateway restarted",
    detail: "Graceful restart requested via dashboard",
    timestamp: Date.now() - 25200000,
    level: "success",
    deviceId: DID,
  },
  {
    activityType: "message_handled",
    title: "Telegram message",
    detail: "Chat 8455877806 · alerts",
    timestamp: Date.now() - 27000000,
    level: "info",
    deviceId: DID,
  },
  {
    activityType: "brain_write",
    title: "Wiki page",
    detail: "Created: llm-router-notes",
    timestamp: Date.now() - 28800000,
    level: "info",
    deviceId: DID,
  },
  {
    activityType: "cron_fired",
    title: "brain-ingest",
    detail: "Ingested 4 new sources",
    timestamp: Date.now() - 30600000,
    level: "success",
    deviceId: DID,
  },
];

export const CROWN_TEXT = [
  "runsvdir -P $PREFIX/var/service/",
  "├── bot       → hermes gateway run --replace  (8642)",
  "├── bot2      → hermes gateway run             (8643)",
  "├── web       → hermes dashboard --port 9119",
  "├── search    → SearXNG (waitress)             (8888)",
  "├── tunnel    → serveo_tunnel.py               (nobilem)",
  "├── proxy     → dashboard_proxy.py             (9120→9119)",
  "└── scraper   → scraper_service.py             (8777)",
  "",
  "Boot: ~/.termux/boot/start-crown.sh",
  "Guard: ~/.bashrc auto-restore on app reopen",
].join("\n");

export const ROUTER_TEXT = [
  "Default:  tencent/hy3:free (kilocode)  ← MAIN session",
  "Auxiliary:",
  "  vision:       nvidia/nemotron-3-nano-omni-30b:free (kilocode)",
  "  web_extract:  mimo-v2.5-free (opencode-zen)",
  "  compression:  nvidia/nemotron-3-super-120b:free (openrouter)",
  "  title_gen:    laguna-s-2.1-free (opencode-zen)",
  "  curator:      nemotron-3.5-lightning-free (opencode-zen)",
  "⚠ NEVER switch MAIN session to a research model",
].join("\n");

export const VAULT_TEXT = [
  "VAULT.md / 00 Inbox / 10 Projects / 20 Areas",
  "30 Resources/",
  "  sources/  wiki/  _meta/",
  "40 Archive / Daily Notes / session-log",
].join("\n");