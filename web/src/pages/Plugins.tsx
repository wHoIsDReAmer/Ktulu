import { Loader2, Package, RefreshCw, Trash2 } from "lucide-solid";
import { type Component, createResource, createSignal, For } from "solid-js";
import { deleteJson, fetchJson, postJson } from "../lib/api";

interface Plugin {
  name: string;
  version: string;
  enabled: boolean;
  description: string;
  authors: string[];
}

const Plugins: Component = () => {
  const [plugins, { refetch, mutate }] = createResource(() =>
    fetchJson<Plugin[]>("/plugins"),
  );
  const [search, setSearch] = createSignal("");

  const filtered = () => {
    const list = plugins() ?? [];
    const q = search().toLowerCase();
    return q ? list.filter((p) => p.name.toLowerCase().includes(q)) : list;
  };

  const togglePlugin = async (name: string) => {
    const updated = await postJson<Plugin>(`/plugins/${name}/toggle`);
    mutate((prev) => prev?.map((p) => (p.name === updated.name ? updated : p)));
  };

  const removePlugin = async (name: string) => {
    await deleteJson(`/plugins/${name}`);
    mutate((prev) => prev?.filter((p) => p.name !== name));
  };

  return (
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">Plugins</h1>
          <p class="mt-1 text-sm text-surface-500">
            {plugins()
              ? `${plugins()?.length} plugins installed`
              : "Loading..."}
          </p>
        </div>
        <button
          type="button"
          class="rounded-xl bg-accent-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent-600 active:scale-95"
          onClick={refetch}
        >
          <span class="flex items-center gap-1.5">
            <RefreshCw size={14} /> Refresh
          </span>
        </button>
      </div>

      <input
        type="text"
        placeholder="Search plugins..."
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
          Failed to load plugins. Is the server running?
        </div>
      )}

      <div class="space-y-3">
        <For each={filtered()}>
          {(plugin) => (
            <div class="flex items-center justify-between rounded-2xl border border-surface-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-surface-800 dark:bg-surface-900">
              <div class="flex items-center gap-4">
                <div
                  class={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    plugin.enabled
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
                  </div>
                  <p class="mt-0.5 text-sm text-surface-500">
                    {plugin.description}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  class={`relative h-6 w-11 rounded-full transition-colors ${
                    plugin.enabled
                      ? "bg-accent-500"
                      : "bg-surface-300 dark:bg-surface-700"
                  }`}
                  onClick={() => togglePlugin(plugin.name)}
                >
                  <span
                    class={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      plugin.enabled ? "translate-x-5" : ""
                    }`}
                  />
                </button>
                <button
                  type="button"
                  class="rounded-lg px-3 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                  onClick={() => removePlugin(plugin.name)}
                >
                  <span class="flex items-center gap-1">
                    <Trash2 size={12} /> Remove
                  </span>
                </button>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export default Plugins;
