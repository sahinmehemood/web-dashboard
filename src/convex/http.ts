import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

// ── Termux data ingestion endpoints ────────────────────────────────

http.route({
  path: "/api/telemetry",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const {
        deviceId,
        hostname,
        batteryPercent,
        batteryStatus,
        cpuUsagePercent,
        cpuCores,
        memUsedMb,
        memTotalMb,
        storageUsedGb,
        storageTotalGb,
        uptimeSeconds,
        loadAvg1,
        loadAvg5,
        loadAvg15,
        networkOnline,
      } = body;

      if (!deviceId || batteryPercent == null || cpuUsagePercent == null) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { api } = await import("./_generated/api");
      await ctx.runMutation(api.dashboard.ingestTelemetry, {
        deviceId,
        hostname: hostname ?? undefined,
        batteryPercent,
        batteryStatus: batteryStatus ?? "Unknown",
        cpuUsagePercent,
        cpuCores: cpuCores ?? 1,
        memUsedMb: memUsedMb ?? 0,
        memTotalMb: memTotalMb ?? 0,
        storageUsedGb: storageUsedGb ?? 0,
        storageTotalGb: storageTotalGb ?? 0,
        uptimeSeconds: uptimeSeconds ?? 0,
        loadAvg1: loadAvg1 ?? 0,
        loadAvg5: loadAvg5 ?? 0,
        loadAvg15: loadAvg15 ?? 0,
        networkOnline: networkOnline ?? true,
      });

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// ── Crown health ingestion ─────────────────────────────────────────
http.route({
  path: "/api/crown-health",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { deviceId, crownStatus, runsvdirCount, services, orphans } = body;

      if (!deviceId) {
        return new Response(JSON.stringify({ error: "Missing deviceId" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { api } = await import("./_generated/api");
      await ctx.runMutation(api.dashboard.ingestCrownHealth, {
        deviceId,
        crownStatus: crownStatus ?? "UNKNOWN",
        runsvdirCount: runsvdirCount ?? 0,
        services: services ?? [],
        orphans: orphans ?? 0,
      });

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// ── Provider ingestion ─────────────────────────────────────────────
http.route({
  path: "/api/providers",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { deviceId, name, displayName, enabled, baseUrl, models, failureReason } = body;

      if (!deviceId || !name) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { api } = await import("./_generated/api");
      await ctx.runMutation(api.dashboard.upsertProvider, {
        deviceId,
        name,
        displayName: displayName ?? name,
        enabled: enabled ?? true,
        baseUrl: baseUrl ?? undefined,
        models: models ?? [],
        failureReason: failureReason ?? undefined,
      });

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// ── Cron job ingestion ─────────────────────────────────────────────
http.route({
  path: "/api/crons",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const {
        deviceId, jobId, name, schedule, kind, enabled, state,
        lastStatus, lastError, lastRunAt, nextRunAt, completedCount, noAgent,
      } = body;

      if (!deviceId || !name) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { api } = await import("./_generated/api");
      await ctx.runMutation(api.dashboard.upsertCronJob, {
        deviceId,
        jobId: jobId ?? "",
        name,
        schedule: schedule ?? "",
        kind: kind ?? "cron",
        enabled: enabled ?? true,
        state: state ?? "scheduled",
        lastStatus: lastStatus ?? undefined,
        lastError: lastError ?? undefined,
        lastRunAt: lastRunAt ?? undefined,
        nextRunAt: nextRunAt ?? undefined,
        completedCount: completedCount ?? 0,
        noAgent: noAgent ?? true,
      });

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// ── Brain stats ingestion ──────────────────────────────────────────
http.route({
  path: "/api/brain-stats",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const {
        deviceId, totalNotes, wikiPages, sources, inboxItems,
        dailyNotes, sessionLogs, lastGitSyncAt, lastIngestAt,
      } = body;

      if (!deviceId) {
        return new Response(JSON.stringify({ error: "Missing deviceId" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { api } = await import("./_generated/api");
      await ctx.runMutation(api.dashboard.upsertBrainStats, {
        deviceId,
        totalNotes: totalNotes ?? 0,
        wikiPages: wikiPages ?? 0,
        sources: sources ?? 0,
        inboxItems: inboxItems ?? 0,
        dailyNotes: dailyNotes ?? 0,
        sessionLogs: sessionLogs ?? 0,
        lastGitSyncAt: lastGitSyncAt ?? undefined,
        lastIngestAt: lastIngestAt ?? undefined,
      });

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// ── Activity ingestion ─────────────────────────────────────────────
http.route({
  path: "/api/activity",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { deviceId, activityType, title, detail } = body;

      if (!deviceId || !activityType || !title) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { api } = await import("./_generated/api");
      await ctx.runMutation(api.dashboard.ingestActivity, {
        deviceId,
        activityType,
        title,
        detail: detail ?? undefined,
      });

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// ── Command polling endpoint (Termux polls this) ─────────────────────
http.route({
  path: "/api/commands",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const deviceId = url.searchParams.get("deviceId");
      if (!deviceId) {
        return new Response(JSON.stringify({ error: "Missing deviceId" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { api } = await import("./_generated/api");
      const commands = await ctx.runQuery(api.dashboard.pendingCommands, { deviceId });

      return new Response(JSON.stringify({ commands }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// ── Command result reporting ─────────────────────────────────────────
http.route({
  path: "/api/command-result",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { commandId, status, result } = body;

      if (!commandId) {
        return new Response(JSON.stringify({ error: "Missing commandId" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { api } = await import("./_generated/api");
      await ctx.runMutation(api.dashboard.updateCommandResult, {
        commandId,
        status: status ?? "executed",
        result: result ?? undefined,
      });

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

export default http;
