import { Loader2, Settings } from "lucide-solid";
import {
  type Component,
  createResource,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";
import { addToast } from "../components/Toast";
import { fetchJson, postJson } from "../lib/api";

interface SystemInfo {
  cpuUsage: number;
  memoryUsage: number;
  totalMemory: number;
  tps: number;
  onlinePlayers: number;
  maxPlayers: number;
  serverVersion: string;
  uptime: number;
}

const StatCard: Component<{
  label: string;
  value: string;
  sub?: string;
  color?: string;
}> = (props) => (
  <div class="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
    <p class="text-sm text-surface-500">{props.label}</p>
    <p
      class={`mt-1 text-3xl font-bold tabular-nums ${props.color ?? "text-accent-500"}`}
    >
      {props.value}
    </p>
    {props.sub && <p class="mt-1 text-xs text-surface-400">{props.sub}</p>}
  </div>
);

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const Dashboard: Component = () => {
  const [systemInfo, { refetch }] = createResource(() =>
    fetchJson<SystemInfo>("/system-info"),
  );

  onMount(() => {
    const id = window.setInterval(refetch, 3000);
    onCleanup(() => clearInterval(id));
  });

  const [reloading, setReloading] = createSignal(false);
  const reloadConfig = async () => {
    setReloading(true);
    try {
      await postJson("/config/reload");
      addToast("Config reloaded", true);
    } catch {
      addToast("Failed to reload config", false);
    } finally {
      setReloading(false);
    }
  };

  const memPercent = () => {
    const info = systemInfo();
    if (!info) return "--";
    return `${Math.round((info.memoryUsage / info.totalMemory) * 100)}%`;
  };

  const tpsColor = () => {
    const tps = systemInfo()?.tps;
    if (tps == null) return "text-accent-500";
    if (tps >= 18) return "text-green-500";
    if (tps >= 15) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">Dashboard</h1>
          <p class="mt-1 text-sm text-surface-500">Server resource overview</p>
        </div>
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-xl border border-surface-300 bg-white px-4 py-2 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 active:scale-95 disabled:opacity-50 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
          onClick={reloadConfig}
          disabled={reloading()}
        >
          {reloading() ? (
            <Loader2 size={14} class="animate-spin" />
          ) : (
            <Settings size={14} />
          )}
          Reload Config
        </button>
      </div>

      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="TPS"
          value={
            systemInfo()?.tps != null
              ? `${Math.round(systemInfo()?.tps ?? 0)}`
              : "--"
          }
          color={tpsColor()}
        />
        <StatCard
          label="Players"
          value={
            systemInfo()
              ? `${systemInfo()?.onlinePlayers} / ${systemInfo()?.maxPlayers}`
              : "--"
          }
        />
        <StatCard
          label="CPU Usage"
          value={`${systemInfo()?.cpuUsage ?? "--"}%`}
        />
        <StatCard label="Memory" value={memPercent()} />
        <StatCard
          label="Uptime"
          value={
            systemInfo()?.uptime != null
              ? formatUptime(systemInfo()?.uptime)
              : "--"
          }
          sub={systemInfo()?.serverVersion || undefined}
        />
      </div>

      <Card title="Resource Monitor">
        {systemInfo.loading && !systemInfo() && (
          <div class="flex justify-center py-12">
            <div class="h-8 w-8 animate-spin rounded-full border-2 border-surface-300 border-t-accent-500 dark:border-surface-700" />
          </div>
        )}

        {systemInfo.error && (
          <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
            Unable to connect to server
          </div>
        )}

        {systemInfo() && (
          <div class="space-y-5">
            <ProgressBar
              label="CPU"
              value={systemInfo()?.cpuUsage ?? 0}
              max={100}
              unit="%"
            />
            <ProgressBar
              label="Memory"
              value={systemInfo()?.memoryUsage ?? 0}
              max={systemInfo()?.totalMemory ?? 0}
              unit="MB"
              color="bg-blue-500"
            />
            <ProgressBar
              label="TPS"
              value={systemInfo()?.tps ?? 0}
              max={20}
              color={
                (systemInfo()?.tps ?? 20) >= 18
                  ? "bg-green-500"
                  : (systemInfo()?.tps ?? 20) >= 15
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
