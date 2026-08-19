import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DID, DA, DAG, DBR, DC, DCR, DP, DBT, DT, DDEV } from "@/lib/demo";
import type {
  ActivityEvent,
  AgentInstance,
  ApiProvider,
  BrainStats,
  CronJob,
  CrownHealth,
  DeviceIdentity,
  DeviceTelemetry,
  TelegramBot,
} from "@/lib/demo";

export function useTelemetry() {
  const live = useQuery(api.dashboard.latestTelemetry, { deviceId: DID });
  return { data: live ?? DT, isDemo: live == null } as {
    data: DeviceTelemetry;
    isDemo: boolean;
  };
}

export function useDeviceIdentity() {
  const live = useQuery(api.dashboard.deviceIdentity, { deviceId: DID });
  return { data: live ?? DDEV, isDemo: live == null } as {
    data: DeviceIdentity;
    isDemo: boolean;
  };
}

export function useCrown() {
  const live = useQuery(api.dashboard.latestCrownHealth, { deviceId: DID });
  return { data: live ?? DC, isDemo: live == null } as {
    data: CrownHealth;
    isDemo: boolean;
  };
}

export function useProviders() {
  const live = useQuery(api.dashboard.providers, { deviceId: DID });
  return { data: live ?? DP, isDemo: live == null } as {
    data: ApiProvider[];
    isDemo: boolean;
  };
}

export function useCrons() {
  const live = useQuery(api.dashboard.cronJobs, { deviceId: DID });
  return { data: live ?? DCR, isDemo: live == null } as {
    data: CronJob[];
    isDemo: boolean;
  };
}

export function useBrain() {
  const live = useQuery(api.dashboard.brainStats, { deviceId: DID });
  return { data: live ?? DBR, isDemo: live == null } as {
    data: BrainStats;
    isDemo: boolean;
  };
}

export function useBots() {
  const live = useQuery(api.dashboard.telegramBots, { deviceId: DID });
  return { data: live ?? DBT, isDemo: live == null } as {
    data: TelegramBot[];
    isDemo: boolean;
  };
}

export function useActivity(limit = 12) {
  const live = useQuery(api.dashboard.recentActivity, {
    deviceId: DID,
    limit,
  });
  return { data: live ?? DA, isDemo: live == null } as {
    data: ActivityEvent[];
    isDemo: boolean;
  };
}

export function useAgents() {
  const live = useQuery(api.dashboard.agents, { deviceId: DID });
  return { data: live ?? DAG, isDemo: live == null } as {
    data: AgentInstance[];
    isDemo: boolean;
  };
}

export function useSendCommand() {
  const mutation = useMutation(api.dashboard.createCommand);
  const { isDemo } = useTelemetry();

  return async (args: { deviceId: string; commandType: string; payload?: string }) => {
    if (isDemo) {
      // In demo mode, simulate success so the UI doesn't break.
      return { _demo: true };
    }
    return mutation(args);
  };
}

export function isAnyDemo(flags: boolean[]): boolean {
  return flags.some(Boolean);
}