import {
  Ban,
  Crown,
  Gamepad2,
  MapPin,
  Search,
  Shield,
  ShieldOff,
  UserMinus,
  UserPlus,
  X,
} from "lucide-solid";
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
import ConfirmModal from "../components/ConfirmModal";
import { addToast } from "../components/Toast";
import { fetchJson, postJsonBody } from "../lib/api";
import { useI18n } from "../lib/i18n";

interface PlayerInfo {
  name: string;
  uuid: string;
  ping: number;
  world: string;
  health: number;
  level: number;
  gameMode: string;
  op: boolean;
  x: number;
  y: number;
  z: number;
}

interface WhitelistData {
  enabled: boolean;
  players: string[];
}

interface ConfirmState {
  title: string;
  message: string;
  confirmLabel: string;
  danger: boolean;
  onConfirm: () => Promise<void>;
}

const gameModes = ["SURVIVAL", "CREATIVE", "ADVENTURE", "SPECTATOR"];

const Users: Component = () => {
  const { t } = useI18n();
  const [players, { refetch: refetchPlayers }] = createResource(() =>
    fetchJson<PlayerInfo[]>("/players"),
  );
  const [banned, { refetch: refetchBanned }] = createResource(() =>
    fetchJson<string[]>("/players/banned"),
  );
  const [whitelist, { refetch: refetchWhitelist }] = createResource(() =>
    fetchJson<WhitelistData>("/whitelist"),
  );

  onMount(() => {
    const id = window.setInterval(() => {
      refetchPlayers();
    }, 5000);
    onCleanup(() => clearInterval(id));
  });

  const [search, setSearch] = createSignal("");
  const [acting, setActing] = createSignal<string | null>(null);
  const [whitelistInput, setWhitelistInput] = createSignal("");
  const [unbanInput, setUnbanInput] = createSignal("");
  const [tab, setTab] = createSignal<"players" | "banned" | "whitelist">(
    "players",
  );
  const [confirm, setConfirm] = createSignal<ConfirmState | null>(null);

  const filtered = () => {
    const q = search().toLowerCase();
    return (players() ?? []).filter((p) => p.name.toLowerCase().includes(q));
  };

  const action = async (
    endpoint: string,
    body: Record<string, string>,
    successMsg: string,
  ) => {
    const key = body.name ?? "";
    setActing(key + endpoint);
    try {
      await postJsonBody(endpoint, body);
      addToast(successMsg, true);
      refetchPlayers();
      refetchBanned();
      refetchWhitelist();
    } catch {
      addToast(`Failed: ${successMsg}`, false);
    } finally {
      setActing(null);
    }
  };

  const showConfirm = (state: ConfirmState) => setConfirm(state);
  const closeConfirm = () => setConfirm(null);

  const isActing = (key: string) => acting() === key;

  return (
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">{t("users.title")}</h1>
          <p class="mt-1 text-sm text-surface-500">{t("users.subtitle")}</p>
        </div>
        <span class="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3.5 py-1.5 text-sm font-medium text-green-600 dark:border-green-900 dark:bg-green-950/50 dark:text-green-400">
          <span class="h-2 w-2 rounded-full bg-green-500" />
          {t("users.online", { count: players()?.length ?? 0 })}
        </span>
      </div>

      <div class="flex gap-1 rounded-xl border border-surface-200 bg-white p-1 dark:border-surface-800 dark:bg-surface-900">
        <For
          each={
            [
              { key: "players", labelKey: "users.onlinePlayers" },
              { key: "banned", labelKey: "users.banList" },
              { key: "whitelist", labelKey: "users.whitelist" },
            ] as const
          }
        >
          {(tab_item) => (
            <button
              type="button"
              onClick={() => setTab(tab_item.key)}
              class={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                tab() === tab_item.key
                  ? "bg-accent-500 text-white shadow-sm"
                  : "text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
              }`}
            >
              {t(tab_item.labelKey)}
            </button>
          )}
        </For>
      </div>

      <Show when={tab() === "players"}>
        <div class="relative">
          <Search
            size={16}
            class="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400"
          />
          <input
            type="text"
            placeholder={t("users.searchPlaceholder")}
            class="w-full rounded-xl border border-surface-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-surface-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-surface-700 dark:bg-surface-900 dark:placeholder:text-surface-600 dark:focus:border-accent-400"
            value={search()}
            onInput={(e) => setSearch(e.currentTarget.value)}
          />
        </div>

        <Show
          when={(filtered().length ?? 0) > 0}
          fallback={
            <Card title={t("users.playerList")}>
              <p class="py-8 text-center text-sm text-surface-400">
                {t("users.noPlayersOnline")}
              </p>
            </Card>
          }
        >
          <div class="space-y-3">
            <For each={filtered()}>
              {(player) => (
                <div class="rounded-2xl border border-surface-200 bg-white p-4 dark:border-surface-800 dark:bg-surface-900">
                  <div class="flex items-start justify-between">
                    <div class="flex items-center gap-3">
                      <img
                        src={`https://mc-heads.net/avatar/${player.uuid}/36`}
                        alt={player.name}
                        class="h-9 w-9 rounded-lg"
                      />
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="font-medium">{player.name}</span>
                          <Show when={player.op}>
                            <span class="rounded-md bg-yellow-100 px-1.5 py-0.5 text-[10px] font-bold text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400">
                              OP
                            </span>
                          </Show>
                          <span class="rounded-md bg-surface-100 px-1.5 py-0.5 text-[10px] font-medium text-surface-500 dark:bg-surface-800">
                            {player.gameMode}
                          </span>
                        </div>
                        <div class="mt-0.5 flex items-center gap-3 text-xs text-surface-400">
                          <span>Lv.{player.level}</span>
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
                          <span class="flex items-center gap-1">
                            <MapPin size={10} />
                            {player.world} ({player.x}, {player.y}, {player.z})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="mt-3 flex flex-wrap gap-1.5 border-t border-surface-100 pt-3 dark:border-surface-800">
                    <For each={gameModes.filter((m) => m !== player.gameMode)}>
                      {(mode) => (
                        <button
                          type="button"
                          onClick={() =>
                            action(
                              "/players/gamemode",
                              { name: player.name, mode },
                              `${player.name} → ${mode}`,
                            )
                          }
                          disabled={isActing(`${player.name}/players/gamemode`)}
                          class="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1 text-xs font-medium text-surface-500 transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
                        >
                          <Gamepad2 size={12} />
                          {mode.charAt(0) + mode.slice(1).toLowerCase()}
                        </button>
                      )}
                    </For>
                    <button
                      type="button"
                      onClick={() =>
                        action(
                          player.op ? "/players/deop" : "/players/op",
                          { name: player.name },
                          player.op
                            ? t("users.deopped", { name: player.name })
                            : t("users.opped", { name: player.name }),
                        )
                      }
                      class="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1 text-xs font-medium text-yellow-600 transition-colors hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-950/30"
                    >
                      {player.op ? (
                        <>
                          <ShieldOff size={12} /> {t("users.deop")}
                        </>
                      ) : (
                        <>
                          <Crown size={12} /> {t("users.op")}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        showConfirm({
                          title: t("users.kickTitle", { name: player.name }),
                          message: t("users.kickMessage", {
                            name: player.name,
                          }),
                          confirmLabel: t("users.kick"),
                          danger: true,
                          onConfirm: async () => {
                            await action(
                              "/players/kick",
                              { name: player.name },
                              t("users.kicked", { name: player.name }),
                            );
                            closeConfirm();
                          },
                        })
                      }
                      class="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1 text-xs font-medium text-orange-500 transition-colors hover:bg-orange-50 dark:hover:bg-orange-950/30"
                    >
                      <UserMinus size={12} /> {t("users.kick")}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        showConfirm({
                          title: t("users.banTitle", { name: player.name }),
                          message: t("users.banMessage", { name: player.name }),
                          confirmLabel: t("users.ban"),
                          danger: true,
                          onConfirm: async () => {
                            await action(
                              "/players/ban",
                              { name: player.name },
                              t("users.banned", { name: player.name }),
                            );
                            closeConfirm();
                          },
                        })
                      }
                      class="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Ban size={12} /> {t("users.ban")}
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Show>

      <Show when={tab() === "banned"}>
        <Card title={t("users.bannedPlayers")}>
          <div class="mb-4 flex gap-2">
            <input
              type="text"
              placeholder={t("users.unbanPlaceholder")}
              class="flex-1 rounded-xl border border-surface-300 bg-white px-4 py-2 text-sm outline-none transition-colors placeholder:text-surface-400 focus:border-accent-500 dark:border-surface-700 dark:bg-surface-900 dark:placeholder:text-surface-600"
              value={unbanInput()}
              onInput={(e) => setUnbanInput(e.currentTarget.value)}
            />
            <button
              type="button"
              onClick={() => {
                const name = unbanInput().trim();
                if (!name) return;
                action(
                  "/players/unban",
                  { name },
                  t("users.unbanned", { name }),
                );
                setUnbanInput("");
              }}
              class="rounded-xl bg-green-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-green-600 active:scale-95"
            >
              {t("users.unban")}
            </button>
          </div>
          <Show
            when={(banned()?.length ?? 0) > 0}
            fallback={
              <p class="py-4 text-center text-sm text-surface-400">
                {t("users.noBannedPlayers")}
              </p>
            }
          >
            <div class="flex flex-wrap gap-2">
              <For each={banned()}>
                {(name) => (
                  <div class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm dark:border-red-900 dark:bg-red-950/50">
                    <span class="text-red-700 dark:text-red-400">{name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        action(
                          "/players/unban",
                          { name },
                          t("users.unbanned", { name }),
                        )
                      }
                      class="text-red-400 transition-colors hover:text-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </Card>
      </Show>

      <Show when={tab() === "whitelist"}>
        <Card title={t("users.whitelist")}>
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await postJsonBody<{ enabled: boolean }>(
                      "/whitelist/toggle",
                      {},
                    );
                    addToast(
                      res.enabled
                        ? t("users.whitelistEnabled")
                        : t("users.whitelistDisabled"),
                      true,
                    );
                    refetchWhitelist();
                  } catch {
                    addToast(t("users.whitelistToggleFailed"), false);
                  }
                }}
                class={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  whitelist()?.enabled
                    ? "bg-accent-500"
                    : "bg-surface-300 dark:bg-surface-700"
                }`}
              >
                <span
                  class={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    whitelist()?.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span class="text-sm text-surface-500">
                {whitelist()?.enabled
                  ? t("common.enabled")
                  : t("common.disabled")}
              </span>
            </div>
          </div>

          <div class="mb-4 flex gap-2">
            <input
              type="text"
              placeholder={t("users.addToWhitelist")}
              class="flex-1 rounded-xl border border-surface-300 bg-white px-4 py-2 text-sm outline-none transition-colors placeholder:text-surface-400 focus:border-accent-500 dark:border-surface-700 dark:bg-surface-900 dark:placeholder:text-surface-600"
              value={whitelistInput()}
              onInput={(e) => setWhitelistInput(e.currentTarget.value)}
            />
            <button
              type="button"
              onClick={() => {
                const name = whitelistInput().trim();
                if (!name) return;
                action(
                  "/whitelist/add",
                  { name },
                  t("users.whitelistAdded", { name }),
                );
                setWhitelistInput("");
              }}
              class="flex items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-accent-600 active:scale-95"
            >
              <UserPlus size={14} /> {t("common.add")}
            </button>
          </div>

          <Show
            when={(whitelist()?.players?.length ?? 0) > 0}
            fallback={
              <p class="py-4 text-center text-sm text-surface-400">
                {t("users.whitelistEmpty")}
              </p>
            }
          >
            <div class="flex flex-wrap gap-2">
              <For each={whitelist()?.players}>
                {(name) => (
                  <div class="flex items-center gap-2 rounded-lg border border-surface-200 bg-surface-50 px-3 py-1.5 text-sm dark:border-surface-800 dark:bg-surface-800">
                    <Shield size={12} class="text-accent-500" />
                    <span>{name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        showConfirm({
                          title: t("users.removeFromWhitelistTitle"),
                          message: t("users.removeFromWhitelistMessage", {
                            name,
                          }),
                          confirmLabel: t("common.remove"),
                          danger: true,
                          onConfirm: async () => {
                            await action(
                              "/whitelist/remove",
                              { name },
                              t("users.whitelistRemoved", { name }),
                            );
                            closeConfirm();
                          },
                        })
                      }
                      class="text-surface-400 transition-colors hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </Card>
      </Show>

      <Show when={confirm()}>
        {(c) => (
          <ConfirmModal
            title={c().title}
            message={c().message}
            confirmLabel={c().confirmLabel}
            danger={c().danger}
            onConfirm={c().onConfirm}
            onCancel={closeConfirm}
          />
        )}
      </Show>
    </div>
  );
};

export default Users;
