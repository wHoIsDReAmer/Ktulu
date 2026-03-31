import { Loader2, Settings, Terminal } from "lucide-solid";
import {
  type Component,
  createResource,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";
import { addToast } from "../components/Toast";
import { fetchJson, postJson, postJsonBody } from "../lib/api";

interface SystemInfo {
  cpuUsage: number;
  memoryUsage: number;
  totalMemory: number;
  tps: number;
  onlinePlayers: number;
  maxPlayers: number;
  serverVersion: string;
  uptime: number;
  diskUsed: number;
  diskTotal: number;
}

interface PlayerInfo {
  name: string;
  uuid: string;
  ping: number;
  world: string;
  health: number;
  level: number;
}

interface WorldInfo {
  name: string;
  environment: string;
  players: number;
  entities: number;
  loadedChunks: number;
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

const envLabel: Record<string, string> = {
  NORMAL: "Overworld",
  NETHER: "Nether",
  THE_END: "The End",
};

const quickCommands = [
  { label: "Clear Weather", command: "weather clear" },
  { label: "Set Day", command: "time set day" },
  { label: "Set Night", command: "time set night" },
  { label: "Save All", command: "save-all" },
];

const Dashboard: Component = () => {
  const [systemInfo, { refetch: refetchSystem }] = createResource(() =>
    fetchJson<SystemInfo>("/system-info"),
  );
  const [players, { refetch: refetchPlayers }] = createResource(() =>
    fetchJson<PlayerInfo[]>("/players"),
  );
  const [worlds, { refetch: refetchWorlds }] = createResource(() =>
    fetchJson<WorldInfo[]>("/worlds"),
  );
  const [recentLogs, { refetch: refetchLogs }] = createResource(() =>
    fetchJson<string[]>("/console/recent?lines=20"),
  );

  onMount(() => {
    const id = window.setInterval(() => {
      refetchSystem();
      refetchPlayers();
      refetchWorlds();
      refetchLogs();
    }, 3000);
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

  const [runningCmd, setRunningCmd] = createSignal<string | null>(null);
  const runCommand = async (command: string) => {
    setRunningCmd(command);
    try {
      await postJsonBody("/command", { command });
      addToast(`Executed: ${command}`, true);
    } catch {
      addToast(`Failed: ${command}`, false);
    } finally {
      setRunningCmd(null);
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

      {/* Stat Cards */}
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
              ? formatUptime(systemInfo()?.uptime ?? 0)
              : "--"
          }
          sub={systemInfo()?.serverVersion || undefined}
        />
      </div>

      {/* Resource Monitor */}
      <Card title="Resource Monitor">
        <Show
          when={systemInfo()}
          fallback={
            <Show
              when={systemInfo.loading}
              fallback={
                <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
                  Unable to connect to server
                </div>
              }
            >
              <div class="flex justify-center py-12">
                <div class="h-8 w-8 animate-spin rounded-full border-2 border-surface-300 border-t-accent-500 dark:border-surface-700" />
              </div>
            </Show>
          }
        >
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
              value={Math.round(systemInfo()?.tps ?? 0)}
              max={20}
              color={
                (systemInfo()?.tps ?? 20) >= 18
                  ? "bg-green-500"
                  : (systemInfo()?.tps ?? 20) >= 15
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }
            />
            <ProgressBar
              label="Disk"
              value={systemInfo()?.diskUsed ?? 0}
              max={systemInfo()?.diskTotal ?? 0}
              unit="MB"
              color="bg-purple-500"
            />
          </div>
        </Show>
      </Card>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Online Players */}
        <Card title={`Online Players (${players()?.length ?? 0})`}>
          <Show
            when={(players()?.length ?? 0) > 0}
            fallback={
              <p class="py-4 text-center text-sm text-surface-400">
                No players online
              </p>
            }
          >
            <div class="divide-y divide-surface-100 dark:divide-surface-800">
              <For each={players()}>
                {(player) => (
                  <div class="flex items-center justify-between py-2.5">
                    <div class="flex items-center gap-3">
                      <img
                        src={`https://mc-heads.net/avatar/${player.uuid}/24`}
                        alt={player.name}
                        class="h-6 w-6 rounded"
                      />
                      <div>
                        <span class="text-sm font-medium">{player.name}</span>
                        <span class="ml-2 text-xs text-surface-400">
                          Lv.{player.level}
                        </span>
                      </div>
                    </div>
                    <div class="flex items-center gap-3 text-xs text-surface-500">
                      <span>{player.world}</span>
                      <span
                        class={
                          player.ping < 100
                            ? "text-green-500"
                            : player.ping < 200
                              ? "text-yellow-500"
                              : "text-red-500"
                        }
                      >
                        {player.ping}ms
                      </span>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </Card>

        {/* World Info */}
        <Card title="Worlds">
          <Show
            when={(worlds()?.length ?? 0) > 0}
            fallback={
              <p class="py-4 text-center text-sm text-surface-400">
                No world data
              </p>
            }
          >
            <div class="divide-y divide-surface-100 dark:divide-surface-800">
              <For each={worlds()}>
                {(world) => (
                  <div class="flex items-center justify-between py-2.5">
                    <div>
                      <span class="text-sm font-medium">{world.name}</span>
                      <span class="ml-2 text-xs text-surface-400">
                        {envLabel[world.environment] ?? world.environment}
                      </span>
                    </div>
                    <div class="flex gap-4 text-xs text-surface-500">
                      <span>{world.players} players</span>
                      <span>{world.entities} entities</span>
                      <span>{world.loadedChunks} chunks</span>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </Card>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div class="grid grid-cols-2 gap-2">
            <For each={quickCommands}>
              {(cmd) => (
                <button
                  type="button"
                  onClick={() => runCommand(cmd.command)}
                  disabled={runningCmd() === cmd.command}
                  class="flex items-center justify-center gap-2 rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm font-medium text-surface-600 transition-all hover:bg-surface-50 active:scale-95 disabled:opacity-50 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
                >
                  {runningCmd() === cmd.command ? (
                    <Loader2 size={14} class="animate-spin" />
                  ) : (
                    <Terminal size={14} />
                  )}
                  {cmd.label}
                </button>
              )}
            </For>
          </div>
        </Card>

        {/* Recent Logs */}
        <Card title="Recent Logs">
          <div class="max-h-48 overflow-y-auto rounded-lg bg-surface-950 p-3 font-mono text-xs leading-relaxed text-surface-300">
            <Show
              when={(recentLogs()?.length ?? 0) > 0}
              fallback={
                <p class="text-center text-surface-500">No logs available</p>
              }
            >
              <For each={recentLogs()}>
                {(line) => <div class="whitespace-pre-wrap">{line}</div>}
              </For>
            </Show>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
