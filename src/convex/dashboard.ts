import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Telemetry ──────────────────────────────────────────────────────
export const latestTelemetry = query({
  args: { deviceId: v.string() },
  handler: async (ctx, { deviceId }) => {
    const results = await ctx.db
      .query("deviceTelemetry")
      .withIndex("by_device", (q) => q.eq("deviceId", deviceId))
      .order("desc")
      .first();
    return results;
  },
});

export const telemetryHistory = query({
  args: { deviceId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { deviceId, limit = 30 }) => {
    return await ctx.db
      .query("deviceTelemetry")
      .withIndex("by_device", (q) => q.eq("deviceId", deviceId))
      .order("desc")
      .take(limit);
  },
});

// ── Crown health ───────────────────────────────────────────────────
export const latestCrownHealth = query({
  args: { deviceId: v.string() },
  handler: async (ctx, { deviceId }) => {
    return await ctx.db
      .query("crownHealth")
      .withIndex("by_device", (q) => q.eq("deviceId", deviceId))
      .order("desc")
      .first();
  },
});

// ── Providers ──────────────────────────────────────────────────────
export const providers = query({
  args: { deviceId: v.string() },
  handler: async (ctx, { deviceId }) => {
    const all = await ctx.db
      .query("providers")
      .withIndex("by_device", (q) => q.eq("deviceId", deviceId))
      .collect();
    // Deduplicate: keep latest per provider name
    const seen = new Map<string, typeof all[0]>();
    for (const p of all) {
      const existing = seen.get(p.name);
      if (!existing || p.lastChecked > existing.lastChecked) {
        seen.set(p.name, p);
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
  },
});

// ── Cron jobs ──────────────────────────────────────────────────────
export const cronJobs = query({
  args: { deviceId: v.string() },
  handler: async (ctx, { deviceId }) => {
    const all = await ctx.db
      .query("cronJobs")
      .withIndex("by_device", (q) => q.eq("deviceId", deviceId))
      .collect();
    const seen = new Map<string, typeof all[0]>();
    for (const j of all) {
      const existing = seen.get(j.name);
      if (!existing || j.reportedAt > existing.reportedAt) {
        seen.set(j.name, j);
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
  },
});

// ── Brain stats ────────────────────────────────────────────────────
export const brainStats = query({
  args: { deviceId: v.string() },
  handler: async (ctx, { deviceId }) => {
    return await ctx.db
      .query("brainStats")
      .withIndex("by_device", (q) => q.eq("deviceId", deviceId))
      .order("desc")
      .first();
  },
});

// ── Telegram bots ──────────────────────────────────────────────────
export const telegramBots = query({
  args: { deviceId: v.string() },
  handler: async (ctx, { deviceId }) => {
    const all = await ctx.db
      .query("telegramBots")
      .withIndex("by_device", (q) => q.eq("deviceId", deviceId))
      .collect();
    const seen = new Map<string, typeof all[0]>();
    for (const b of all) {
      const existing = seen.get(b.botId);
      if (!existing || b.reportedAt > existing.reportedAt) {
        seen.set(b.botId, b);
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.role.localeCompare(b.role));
  },
});

// ── Activity feed ──────────────────────────────────────────────────
export const recentActivity = query({
  args: { deviceId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { deviceId, limit = 30 }) => {
    return await ctx.db
      .query("agentActivity")
      .withIndex("by_device", (q) => q.eq("deviceId", deviceId))
      .order("desc")
      .take(limit);
  },
});

// ── Commands ───────────────────────────────────────────────────────
export const pendingCommands = query({
  args: { deviceId: v.string() },
  handler: async (ctx, { deviceId }) => {
    return await ctx.db
      .query("commands")
      .withIndex("by_device_status", (q) =>
        q.eq("deviceId", deviceId).eq("status", "pending")
      )
      .order("desc")
      .take(10);
  },
});

export const commandHistory = query({
  args: { deviceId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 20 }) => {
    return await ctx.db
      .query("commands")
      .withIndex("by_time", (q) => q.gte("createdAt", 0))
      .order("desc")
      .take(limit);
  },
});

export const createCommand = mutation({
  args: {
    deviceId: v.string(),
    commandType: v.string(),
    payload: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("commands", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

// ── Mutations (for Termux scripts to POST data) ────────────────────
export const ingestTelemetry = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("deviceTelemetry", {
      ...args,
      reportedAt: Date.now(),
    });
  },
});

export const ingestCrownHealth = mutation({
  args: {
    deviceId: v.string(),
    crownStatus: v.string(),
    runsvdirCount: v.number(),
    services: v.array(
      v.object({
        name: v.string(),
        status: v.string(),
        pid: v.optional(v.number()),
        uptime: v.optional(v.string()),
      })
    ),
    orphans: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("crownHealth", {
      ...args,
      reportedAt: Date.now(),
    });
  },
});

export const upsertProvider = mutation({
  args: {
    deviceId: v.string(),
    name: v.string(),
    displayName: v.string(),
    enabled: v.boolean(),
    baseUrl: v.optional(v.string()),
    models: v.array(
      v.object({
        name: v.string(),
        isDefault: v.optional(v.boolean()),
        lastLatencyMs: v.optional(v.number()),
        status: v.optional(v.string()),
        lastChecked: v.optional(v.number()),
      })
    ),
    failureReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("providers", {
      ...args,
      lastChecked: Date.now(),
    });
  },
});

export const upsertCronJob = mutation({
  args: {
    deviceId: v.string(),
    jobId: v.string(),
    name: v.string(),
    schedule: v.string(),
    kind: v.string(),
    enabled: v.boolean(),
    state: v.string(),
    lastStatus: v.optional(v.string()),
    lastError: v.optional(v.string()),
    lastRunAt: v.optional(v.number()),
    nextRunAt: v.optional(v.number()),
    completedCount: v.number(),
    noAgent: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("cronJobs", {
      ...args,
      reportedAt: Date.now(),
    });
  },
});

export const upsertBrainStats = mutation({
  args: {
    deviceId: v.string(),
    totalNotes: v.number(),
    wikiPages: v.number(),
    sources: v.number(),
    inboxItems: v.number(),
    dailyNotes: v.number(),
    sessionLogs: v.number(),
    lastGitSyncAt: v.optional(v.number()),
    lastIngestAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("brainStats", {
      ...args,
      reportedAt: Date.now(),
    });
  },
});

export const upsertTelegramBots = mutation({
  args: {
    deviceId: v.string(),
    bots: v.array(
      v.object({
        botId: v.string(),
        username: v.string(),
        role: v.string(),
        status: v.string(),
        apiPort: v.optional(v.number()),
        hermesHome: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, { deviceId, bots }) => {
    const now = Date.now();
    for (const bot of bots) {
      await ctx.db.insert("telegramBots", {
        deviceId,
        ...bot,
        reportedAt: now,
      });
    }
  },
});

export const ingestActivity = mutation({
  args: {
    deviceId: v.string(),
    activityType: v.string(),
    title: v.string(),
    detail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agentActivity", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

export const updateCommandResult = mutation({
  args: {
    commandId: v.id("commands"),
    status: v.string(),
    result: v.optional(v.string()),
  },
  handler: async (ctx, { commandId, status, result }) => {
    await ctx.db.patch(commandId, {
      status,
      result,
      executedAt: Date.now(),
    });
  },
});

// ── Agents ──────────────────────────────────────────────────────
export const agents = query({
  args: { deviceId: v.string() },
  handler: async () => {
    return null;
  },
});

// ── Device identity (model, OS, kernel, etc.) ────────────────────────
export const deviceIdentity = query({
  args: { deviceId: v.string() },
  handler: async (ctx, { deviceId }) => {
    return await ctx.db
      .query("deviceIdentity")
      .withIndex("by_device", (q) => q.eq("deviceId", deviceId))
      .first();
  },
});

export const ingestDeviceIdentity = mutation({
  args: {
    deviceId: v.string(),
    hostname: v.optional(v.string()),
    os: v.optional(v.string()),
    arch: v.optional(v.string()),
    kernel: v.optional(v.string()),
    termuxVersion: v.optional(v.string()),
    model: v.optional(v.string()),
    androidVersion: v.optional(v.string()),
    version: v.optional(v.string()),
    installedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("deviceIdentity")
      .withIndex("by_device", (q) => q.eq("deviceId", args.deviceId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("deviceIdentity", args);
  },
});
