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
import { useI18n } from "../lib/i18n";

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

function formatMB(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${Math.round(mb)} MB`;
}

const envLabel: Record<string, string> = {
  NORMAL: "Overworld",
  NETHER: "Nether",
  THE_END: "The End",
};

const Dashboard: Component = () => {
  const { t } = useI18n();

  const quickCommands = [
    { labelKey: "dashboard.clearWeather", command: "weather clear" },
    { labelKey: "dashboard.setDay", command: "time set day" },
    { labelKey: "dashboard.setNight", command: "time set night" },
    { labelKey: "dashboard.saveAll", command: "save-all" },
  ];

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
      addToast(t("dashboard.configReloaded"), true);
    } catch {
      addToast(t("dashboard.configReloadFailed"), false);
    } finally {
      setReloading(false);
    }
  };

  const [runningCmd, setRunningCmd] = createSignal<string | null>(null);
  const runCommand = async (command: string) => {
    setRunningCmd(command);
    try {
      await postJsonBody("/command", { command });
      addToast(t("dashboard.executed", { command }), true);
    } catch {
      addToast(t("dashboard.executeFailed", { command }), false);
    } finally {
      setRunningCmd(null);
    }
  };

  const memDisplay = () => {
    const info = systemInfo();
    if (!info) return "--";
    return `${formatMB(info.memoryUsage)} / ${formatMB(info.totalMemory)}`;
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
          <h1 class="text-2xl font-bold">{t("dashboard.title")}</h1>
          <p class="mt-1 text-sm text-surface-500">{t("dashboard.subtitle")}</p>
        </div>
        <button
          type="button"
          class="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-surface-300 bg-white px-4 py-2 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 active:scale-95 disabled:opacity-50 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
          onClick={reloadConfig}
          disabled={reloading()}
        >
          {reloading() ? (
            <Loader2 size={14} class="animate-spin" />
          ) : (
            <Settings size={14} />
          )}
          {t("dashboard.reloadConfig")}
        </button>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label={t("dashboard.tps")}
          value={
            systemInfo()?.tps != null
              ? `${Math.round(systemInfo()?.tps ?? 0)}`
              : "--"
          }
          color={tpsColor()}
        />
        <StatCard
          label={t("dashboard.players")}
          value={
            systemInfo()
              ? `${systemInfo()?.onlinePlayers} / ${systemInfo()?.maxPlayers}`
              : "--"
          }
        />
        <StatCard
          label={t("dashboard.cpuUsage")}
          value={`${systemInfo()?.cpuUsage ?? "--"}%`}
        />
        <StatCard label={t("dashboard.memory")} value={memDisplay()} />
        <StatCard
          label={t("dashboard.uptime")}
          value={
            systemInfo()?.uptime != null
              ? formatUptime(systemInfo()?.uptime ?? 0)
              : "--"
          }
          sub={systemInfo()?.serverVersion || undefined}
        />
      </div>

      <Card title={t("dashboard.resourceMonitor")}>
        <Show
          when={systemInfo()}
          fallback={
            <Show
              when={systemInfo.loading}
              fallback={
                <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
                  {t("dashboard.unableToConnect")}
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
              label={t("dashboard.cpu")}
              value={systemInfo()?.cpuUsage ?? 0}
              max={100}
              unit="%"
            />
            <ProgressBar
              label={t("dashboard.memory")}
              value={systemInfo()?.memoryUsage ?? 0}
              max={systemInfo()?.totalMemory ?? 0}
              formatValue={formatMB}
              color="bg-blue-500"
            />
            <ProgressBar
              label={t("dashboard.tps")}
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
              label={t("dashboard.disk")}
              value={systemInfo()?.diskUsed ?? 0}
              max={systemInfo()?.diskTotal ?? 0}
              formatValue={formatMB}
              color="bg-purple-500"
            />
          </div>
        </Show>
      </Card>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          title={`${t("dashboard.onlinePlayers")} (${players()?.length ?? 0})`}
        >
          <Show
            when={(players()?.length ?? 0) > 0}
            fallback={
              <p class="py-4 text-center text-sm text-surface-400">
                {t("dashboard.noPlayersOnline")}
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

        <Card title={t("dashboard.worlds")}>
          <Show
            when={(worlds()?.length ?? 0) > 0}
            fallback={
              <p class="py-4 text-center text-sm text-surface-400">
                {t("dashboard.noWorldData")}
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
                      <span>
                        {world.players} {t("dashboard.players_unit")}
                      </span>
                      <span>
                        {world.entities} {t("dashboard.entities")}
                      </span>
                      <span>
                        {world.loadedChunks} {t("dashboard.chunks")}
                      </span>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </Card>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title={t("dashboard.quickActions")}>
          <div class="grid grid-cols-2 gap-2">
            <For each={quickCommands}>
              {(cmd) => (
                <button
                  type="button"
                  onClick={() => runCommand(cmd.command)}
                  disabled={runningCmd() === cmd.command}
                  class="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm font-medium text-surface-600 transition-all hover:bg-surface-50 active:scale-95 disabled:opacity-50 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
                >
                  {runningCmd() === cmd.command ? (
                    <Loader2 size={14} class="animate-spin" />
                  ) : (
                    <Terminal size={14} />
                  )}
                  {t(cmd.labelKey)}
                </button>
              )}
            </For>
          </div>
        </Card>

        <Card title={t("dashboard.recentLogs")}>
          <div class="max-h-48 overflow-y-auto rounded-lg bg-surface-950 p-3 font-mono text-xs leading-relaxed text-surface-300">
            <Show
              when={(recentLogs()?.length ?? 0) > 0}
              fallback={
                <p class="text-center text-surface-500">
                  {t("dashboard.noLogs")}
                </p>
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
