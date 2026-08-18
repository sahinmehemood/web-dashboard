import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
    }).index("email", ["email"]),

    // ── Device telemetry (posted by Termux collector) ─────────────────
    deviceTelemetry: defineTable({
      deviceId: v.string(),
      hostname: v.optional(v.string()),
      batteryPercent: v.number(),
      batteryStatus: v.string(),
      cpuUsagePercent: v.number(),
      cpuCores: v.number(),
      memUsedMb: v.number(),
      memTotalMb: v.number(),
      storageUsedGb: v.number(),
      storageTotalGb: v.number(),
      uptimeSeconds: v.number(),
      loadAvg1: v.number(),
      loadAvg5: v.number(),
      loadAvg15: v.number(),
      networkOnline: v.boolean(),
      reportedAt: v.number(),
    })
      .index("by_device", ["deviceId", "reportedAt"])
      .index("by_time", ["reportedAt"]),

    // ── Crown health (7 runit services) ────────────────────────────────
    crownHealth: defineTable({
      deviceId: v.string(),
      crownStatus: v.string(), // "GREEN" | "RED"
      runsvdirCount: v.number(),
      services: v.array(
        v.object({
          name: v.string(), // bot, bot2, web, search, tunnel, proxy, scraper
          status: v.string(), // "run" | "down" | "finish" | "unknown"
          pid: v.optional(v.number()),
          uptime: v.optional(v.string()),
        })
      ),
      orphans: v.number(),
      reportedAt: v.number(),
    })
      .index("by_device", ["deviceId", "reportedAt"]),

    // ── API providers ──────────────────────────────────────────────────
    providers: defineTable({
      deviceId: v.string(),
      name: v.string(), // kilocode, openrouter, nvidia, etc.
      displayName: v.string(),
      enabled: v.boolean(),
      baseUrl: v.optional(v.string()),
      models: v.array(
        v.object({
          name: v.string(),
          isDefault: v.optional(v.boolean()),
          lastLatencyMs: v.optional(v.number()),
          status: v.optional(v.string()), // "healthy" | "rate_limited" | "cooldown" | "error"
          lastChecked: v.optional(v.number()),
        })
      ),
      failureReason: v.optional(v.string()),
      lastChecked: v.number(),
    })
      .index("by_device", ["deviceId", "name"]),

    // ── Cron jobs ──────────────────────────────────────────────────────
    cronJobs: defineTable({
      deviceId: v.string(),
      jobId: v.string(),
      name: v.string(),
      schedule: v.string(), // "every 120m" | "0 23 * * *" | "*/5 * * * *"
      kind: v.string(), // "interval" | "cron"
      enabled: v.boolean(),
      state: v.string(), // "scheduled" | "running" | "paused"
      lastStatus: v.optional(v.string()), // "ok" | "error"
      lastError: v.optional(v.string()),
      lastRunAt: v.optional(v.number()),
      nextRunAt: v.optional(v.number()),
      completedCount: v.number(),
      noAgent: v.boolean(),
      reportedAt: v.number(),
    })
      .index("by_device", ["deviceId", "name"]),

    // ── Brain / NOUS vault stats ───────────────────────────────────────
    brainStats: defineTable({
      deviceId: v.string(),
      totalNotes: v.number(),
      wikiPages: v.number(),
      sources: v.number(),
      inboxItems: v.number(),
      dailyNotes: v.number(),
      sessionLogs: v.number(),
      lastGitSyncAt: v.optional(v.number()),
      lastIngestAt: v.optional(v.number()),
      reportedAt: v.number(),
    })
      .index("by_device", ["deviceId", "reportedAt"]),

    // ── Telegram bots ──────────────────────────────────────────────────
    telegramBots: defineTable({
      deviceId: v.string(),
      botId: v.string(),
      username: v.string(),
      role: v.string(), // "main_gateway" | "second_gateway" | "alerts" | "legacy"
      status: v.string(), // "live" | "dead"
      apiPort: v.optional(v.number()),
      hermesHome: v.optional(v.string()),
      reportedAt: v.number(),
    })
      .index("by_device", ["deviceId"]),

    // ── Agent activity feed ────────────────────────────────────────────
    agentActivity: defineTable({
      deviceId: v.string(),
      activityType: v.string(),
      title: v.string(),
      detail: v.optional(v.string()),
      timestamp: v.number(),
    })
      .index("by_device", ["deviceId", "timestamp"]),

    // ── Remote commands ────────────────────────────────────────────────
    commands: defineTable({
      deviceId: v.string(),
      commandType: v.string(),
      payload: v.optional(v.string()),
      status: v.string(), // "pending" | "executing" | "executed" | "failed"
      result: v.optional(v.string()),
      createdAt: v.optional(v.number()),
      executedAt: v.optional(v.number()),
      requestedBy: v.optional(v.string()),
      timestamp: v.optional(v.number()),
    })
      .index("by_device_status", ["deviceId", "status"])
      .index("by_time", ["createdAt"]),
  },
  { schemaValidation: true }
);

export default schema;
