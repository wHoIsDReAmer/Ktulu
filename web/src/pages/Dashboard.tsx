import { Pause, Play, RefreshCw } from "lucide-solid";
import {
  type Component,
  createResource,
  createSignal,
  onCleanup,
} from "solid-js";
import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";
import { fetchJson } from "../lib/api";

interface SystemInfo {
  cpuUsage: number;
  memoryUsage: number;
  totalMemory: number;
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

const Dashboard: Component = () => {
  const [systemInfo, { refetch }] = createResource(() =>
    fetchJson<SystemInfo>("/system-info"),
  );

  const [autoRefresh, setAutoRefresh] = createSignal(false);
  let intervalId: number | undefined;

  const toggleAutoRefresh = () => {
    if (autoRefresh()) {
      clearInterval(intervalId);
      intervalId = undefined;
      setAutoRefresh(false);
    } else {
      intervalId = window.setInterval(refetch, 3000);
      setAutoRefresh(true);
    }
  };

  onCleanup(() => clearInterval(intervalId));

  const memPercent = () => {
    const info = systemInfo();
    if (!info) return "--";
    return `${Math.round((info.memoryUsage / info.totalMemory) * 100)}%`;
  };

  return (
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">Dashboard</h1>
          <p class="mt-1 text-sm text-surface-500">Server resource overview</p>
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            class={`rounded-xl px-4 py-2 text-sm font-medium transition-all active:scale-95 ${
              autoRefresh()
                ? "bg-green-500 text-white shadow-sm"
                : "border border-surface-300 bg-white text-surface-600 hover:bg-surface-100 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
            }`}
            onClick={toggleAutoRefresh}
          >
            <span class="flex items-center gap-1.5">
              {autoRefresh() ? <Pause size={14} /> : <Play size={14} />}
              {autoRefresh() ? "Auto: ON" : "Auto: OFF"}
            </span>
          </button>
          <button
            type="button"
            class="rounded-xl bg-accent-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent-600 active:scale-95"
            onClick={refetch}
          >
            <span class="flex items-center gap-1.5">
              <RefreshCw size={14} />
              Refresh
            </span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="CPU Usage"
          value={`${systemInfo()?.cpuUsage ?? "--"}%`}
        />
        <StatCard label="Memory" value={memPercent()} />
        <StatCard
          label="Status"
          value={systemInfo.error ? "Offline" : "Online"}
          color={systemInfo.error ? "text-red-500" : "text-green-500"}
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
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
