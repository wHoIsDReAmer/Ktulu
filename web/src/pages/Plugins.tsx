import { Package, Search, Trash2, Upload } from "lucide-solid";
import { type Component, createSignal, For } from "solid-js";

interface Plugin {
  name: string;
  version: string;
  enabled: boolean;
  description: string;
}

const mockPlugins: Plugin[] = [
  {
    name: "EssentialsX",
    version: "2.20.1",
    enabled: true,
    description: "Essential commands for Bukkit",
  },
  {
    name: "WorldEdit",
    version: "7.3.0",
    enabled: true,
    description: "World editing toolkit",
  },
  {
    name: "Vault",
    version: "1.7.3",
    enabled: false,
    description: "Economy, permissions & chat API",
  },
];

const Plugins: Component = () => {
  const [plugins, setPlugins] = createSignal(mockPlugins);
  const [search, setSearch] = createSignal("");

  const filtered = () =>
    plugins().filter((p) =>
      p.name.toLowerCase().includes(search().toLowerCase()),
    );

  const togglePlugin = (name: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.name === name ? { ...p, enabled: !p.enabled } : p)),
    );
  };

  return (
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">Plugins</h1>
          <p class="mt-1 text-sm text-surface-500">Manage server plugins</p>
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            class="rounded-xl bg-accent-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent-600 active:scale-95"
          >
            <span class="flex items-center gap-1.5">
              <Upload size={14} /> Upload
            </span>
          </button>
          <button
            type="button"
            class="rounded-xl border border-surface-300 bg-white px-4 py-2 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 active:scale-95 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
          >
            <span class="flex items-center gap-1.5">
              <Search size={14} /> Browse
            </span>
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search plugins..."
        class="w-full rounded-xl border border-surface-300 bg-white px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-surface-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-surface-700 dark:bg-surface-900 dark:placeholder:text-surface-600 dark:focus:border-accent-400"
        value={search()}
        onInput={(e) => setSearch(e.currentTarget.value)}
      />

      <div class="space-y-3">
        <For each={filtered()}>
          {(plugin) => (
            <div class="flex items-center justify-between rounded-2xl border border-surface-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-surface-800 dark:bg-surface-900">
              <div class="flex items-center gap-4">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/10 text-accent-500">
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
