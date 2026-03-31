import {
  Loader2,
  Package,
  Play,
  RefreshCw,
  Square,
  Trash2,
} from "lucide-solid";
import {
  type Component,
  createResource,
  createSignal,
  For,
  Show,
} from "solid-js";
import ConfirmModal from "../components/ConfirmModal";
import { addToast } from "../components/Toast";
import { deleteJson, fetchJson, postJson } from "../lib/api";
import { useI18n } from "../lib/i18n";

interface Plugin {
  name: string;
  version: string;
  enabled: boolean;
  loaded: boolean;
  description: string;
  authors: string[];
  fileName: string;
}

const Plugins: Component = () => {
  const { t } = useI18n();
  const [plugins, { refetch, mutate }] = createResource(() =>
    fetchJson<Plugin[]>("/plugins"),
  );
  const [search, setSearch] = createSignal("");
  const [removing, setRemoving] = createSignal<string | null>(null);
  const [removeTarget, setRemoveTarget] = createSignal<{
    id: string;
    name: string;
  } | null>(null);
  const [unloadTarget, setUnloadTarget] = createSignal<string | null>(null);

  const filtered = () => {
    const list = plugins() ?? [];
    const q = search().toLowerCase();
    return q ? list.filter((p) => p.name.toLowerCase().includes(q)) : list;
  };

  const [unloading, setUnloading] = createSignal<string | null>(null);

  const unloadPlugin = async (name: string) => {
    setUnloading(name);
    try {
      await postJson(`/plugins/${name}/unload`);
      refetch();
      addToast(t("plugins.unloaded", { name }), true);
    } catch {
      addToast(t("plugins.unloadFailed", { name }), false);
    } finally {
      setUnloading(null);
    }
  };

  const [loading, setLoading] = createSignal<string | null>(null);

  const loadPlugin = async (fileName: string, displayName: string) => {
    setLoading(fileName);
    try {
      const result = await postJson<Plugin>(
        `/plugins/${encodeURIComponent(fileName)}/load`,
      );
      mutate((prev) => prev?.map((p) => (p.name === displayName ? result : p)));
      addToast(t("plugins.loaded", { name: result.name }), true);
    } catch {
      addToast(t("plugins.loadFailed", { name: displayName }), false);
    } finally {
      setLoading(null);
    }
  };

  const removePlugin = async (name: string, displayName: string) => {
    setRemoving(name);
    try {
      await deleteJson(`/plugins/${name}`);
      mutate((prev) => prev?.filter((p) => p.name !== displayName));
      addToast(t("plugins.removed", { name: displayName }), true);
    } catch {
      addToast(t("plugins.removeFailed", { name: displayName }), false);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">{t("plugins.title")}</h1>
          <p class="mt-1 text-sm text-surface-500">
            {plugins()
              ? t("plugins.count", { count: plugins()?.length ?? 0 })
              : t("common.loading")}
          </p>
        </div>
        <button
          type="button"
          class="rounded-xl bg-accent-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent-600 active:scale-95"
          onClick={refetch}
        >
          <span class="flex items-center gap-1.5">
            <RefreshCw size={14} /> {t("common.refresh")}
          </span>
        </button>
      </div>

      <input
        type="text"
        placeholder={t("plugins.searchPlaceholder")}
        class="w-full rounded-xl border border-surface-300 bg-white px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-surface-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-surface-700 dark:bg-surface-900 dark:placeholder:text-surface-600 dark:focus:border-accent-400"
        value={search()}
        onInput={(e) => setSearch(e.currentTarget.value)}
      />

      {plugins.loading && (
        <div class="flex justify-center py-12">
          <Loader2 size={24} class="animate-spin text-accent-500" />
        </div>
      )}

      {plugins.error && (
        <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
          {t("plugins.failedToLoad")}
        </div>
      )}

      <div class="space-y-3">
        <For each={filtered()}>
          {(plugin) => (
            <div class="flex items-center justify-between rounded-2xl border border-surface-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-surface-800 dark:bg-surface-900">
              <div class="flex items-center gap-4">
                <div
                  class={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    !plugin.loaded
                      ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-950/50 dark:text-yellow-400"
                      : plugin.enabled
                        ? "bg-accent-500/10 text-accent-500"
                        : "bg-surface-200 text-surface-400 dark:bg-surface-700"
                  }`}
                >
                  <Package size={20} />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <p class="font-semibold">{plugin.name}</p>
                    <span class="rounded-md bg-surface-100 px-1.5 py-0.5 text-xs text-surface-500 dark:bg-surface-800">
                      v{plugin.version}
                    </span>
                    {!plugin.loaded && (
                      <span class="rounded-md bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400">
                        {t("plugins.notLoaded")}
                      </span>
                    )}
                  </div>
                  <p class="mt-0.5 text-sm text-surface-500">
                    {plugin.description}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <Show
                  when={plugin.loaded}
                  fallback={
                    <button
                      type="button"
                      class="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-green-700 active:scale-95 disabled:opacity-40"
                      onClick={() => loadPlugin(plugin.fileName, plugin.name)}
                      disabled={loading() === plugin.fileName}
                    >
                      <Show
                        when={loading() !== plugin.fileName}
                        fallback={<Loader2 size={12} class="animate-spin" />}
                      >
                        <Play size={12} />
                      </Show>
                      {t("plugins.load")}
                    </button>
                  }
                >
                  <button
                    type="button"
                    class="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-surface-200 px-3 py-1.5 text-sm font-medium text-surface-700 transition-all hover:bg-surface-300 active:scale-95 disabled:opacity-40 dark:bg-surface-700 dark:text-surface-300 dark:hover:bg-surface-600"
                    onClick={() => setUnloadTarget(plugin.name)}
                    disabled={
                      unloading() === plugin.name || plugin.name === "Ktulu"
                    }
                  >
                    <Show
                      when={unloading() !== plugin.name}
                      fallback={<Loader2 size={12} class="animate-spin" />}
                    >
                      <Square size={12} />
                    </Show>
                    {t("plugins.unload")}
                  </button>
                </Show>
                <button
                  type="button"
                  class="shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-50 disabled:opacity-40 dark:hover:bg-red-950/30"
                  onClick={() =>
                    setRemoveTarget({
                      id: plugin.loaded ? plugin.name : plugin.fileName,
                      name: plugin.name,
                    })
                  }
                  disabled={
                    removing() ===
                    (plugin.loaded ? plugin.name : plugin.fileName)
                  }
                >
                  <span class="flex items-center gap-1">
                    <Show
                      when={
                        removing() !==
                        (plugin.loaded ? plugin.name : plugin.fileName)
                      }
                      fallback={<Loader2 size={12} class="animate-spin" />}
                    >
                      <Trash2 size={12} />
                    </Show>
                    {t("plugins.remove")}
                  </span>
                </button>
              </div>
            </div>
          )}
        </For>
      </div>

      <Show when={unloadTarget()}>
        <ConfirmModal
          title={t("plugins.unloadTitle")}
          message={t("plugins.unloadMessage", { name: unloadTarget() ?? "" })}
          confirmLabel={t("plugins.unload")}
          danger
          onConfirm={async () => {
            const name = unloadTarget();
            if (name) await unloadPlugin(name);
            setUnloadTarget(null);
          }}
          onCancel={() => setUnloadTarget(null)}
        />
      </Show>

      <Show when={removeTarget()}>
        <ConfirmModal
          title={t("plugins.removeTitle")}
          message={t("plugins.removeMessage", {
            name: removeTarget()?.name ?? "",
          })}
          confirmLabel={t("plugins.remove")}
          danger
          onConfirm={async () => {
            const target = removeTarget();
            if (target) await removePlugin(target.id, target.name);
            setRemoveTarget(null);
          }}
          onCancel={() => setRemoveTarget(null)}
        />
      </Show>
    </div>
  );
};

export default Plugins;
