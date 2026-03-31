import { Download, Loader2, Search, Store } from "lucide-solid";
import { type Component, createSignal, For, Show } from "solid-js";
import { fetchJson, postJsonBody } from "../lib/api";
import { useI18n } from "../lib/i18n";

interface MarketplacePlugin {
  id: string;
  name: string;
  description: string;
  author: string;
  downloads: number;
  iconUrl: string;
  source: string;
  slug: string;
  version: string;
  gameVersions: string[];
}

const Marketplace: Component = () => {
  const { t } = useI18n();
  const [query, setQuery] = createSignal("");
  const [source, setSource] = createSignal<string>("all");
  const [results, setResults] = createSignal<MarketplacePlugin[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [installing, setInstalling] = createSignal<string | null>(null);
  const [message, setMessage] = createSignal<{
    text: string;
    ok: boolean;
  } | null>(null);

  const doSearch = async () => {
    const q = query().trim();
    if (!q) return;
    setLoading(true);
    setMessage(null);
    try {
      const src = source() === "all" ? "" : `&source=${source()}`;
      const data = await fetchJson<MarketplacePlugin[]>(
        `/marketplace/search?query=${encodeURIComponent(q)}${src}`,
      );
      setResults(data);
    } catch {
      setMessage({ text: t("marketplace.searchFailed"), ok: false });
    } finally {
      setLoading(false);
    }
  };

  const install = async (plugin: MarketplacePlugin) => {
    setInstalling(plugin.id);
    setMessage(null);
    try {
      await postJsonBody<{ message: string }>("/marketplace/install", {
        source: plugin.source,
        id: plugin.id,
      });
      setMessage({
        text: t("marketplace.installed", { name: plugin.name }),
        ok: true,
      });
    } catch {
      setMessage({
        text: t("marketplace.installFailed", { name: plugin.name }),
        ok: false,
      });
    } finally {
      setInstalling(null);
    }
  };

  const formatDownloads = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  return (
    <div class="space-y-8">
      <div>
        <h1 class="text-2xl font-bold">{t("marketplace.title")}</h1>
        <p class="mt-1 text-sm text-surface-500">{t("marketplace.subtitle")}</p>
      </div>

      <Show when={message()}>
        {(msg) => (
          <div
            class={`rounded-xl border px-4 py-3 text-sm ${
              msg().ok
                ? "border-green-200 bg-green-50 text-green-600 dark:border-green-900 dark:bg-green-950/50 dark:text-green-400"
                : "border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400"
            }`}
          >
            {msg().text}
          </div>
        )}
      </Show>

      <div class="flex gap-3">
        <div class="flex flex-1 items-center gap-2 rounded-xl border border-surface-300 bg-white px-4 py-2.5 transition-colors focus-within:border-accent-500 focus-within:ring-2 focus-within:ring-accent-500/20 dark:border-surface-700 dark:bg-surface-900 dark:focus-within:border-accent-400">
          <Search size={16} class="text-surface-400" />
          <input
            type="text"
            placeholder={t("marketplace.searchPlaceholder")}
            class="flex-1 bg-transparent text-sm outline-none placeholder:text-surface-400 dark:placeholder:text-surface-600"
            value={query()}
            onInput={(e) => setQuery(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
          />
        </div>
        <select
          class="rounded-xl border border-surface-300 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent-500 dark:border-surface-700 dark:bg-surface-900"
          value={source()}
          onChange={(e) => setSource(e.currentTarget.value)}
        >
          <option value="all">{t("marketplace.allSources")}</option>
          <option value="modrinth">Modrinth</option>
          <option value="hangar">Hangar</option>
        </select>
        <button
          type="button"
          class="rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent-600 active:scale-95"
          onClick={doSearch}
        >
          {t("common.search")}
        </button>
      </div>

      <Show when={loading()}>
        <div class="flex justify-center py-12">
          <Loader2 size={24} class="animate-spin text-accent-500" />
        </div>
      </Show>

      <Show when={!loading() && results().length > 0}>
        <div class="space-y-3">
          <For each={results()}>
            {(plugin) => (
              <div class="flex items-center justify-between rounded-2xl border border-surface-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-surface-800 dark:bg-surface-900">
                <div class="flex items-center gap-4">
                  <div class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-surface-100 dark:bg-surface-800">
                    <Show
                      when={plugin.iconUrl}
                      fallback={<Store size={20} class="text-surface-400" />}
                    >
                      <img
                        src={plugin.iconUrl}
                        alt={plugin.name}
                        class="h-10 w-10 rounded-xl object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </Show>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <p class="font-semibold">{plugin.name}</p>
                      <Show when={plugin.version}>
                        <span class="rounded-md bg-surface-100 px-1.5 py-0.5 text-xs text-surface-500 dark:bg-surface-800">
                          v{plugin.version}
                        </span>
                      </Show>
                      <span
                        class={`rounded-md px-1.5 py-0.5 text-xs font-medium ${
                          plugin.source === "modrinth"
                            ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                        }`}
                      >
                        {plugin.source === "modrinth" ? "Modrinth" : "Hangar"}
                      </span>
                    </div>
                    <p class="mt-0.5 text-sm text-surface-500 line-clamp-1">
                      {plugin.description}
                    </p>
                    <div class="mt-1 flex flex-wrap items-center gap-3 text-xs text-surface-400">
                      <span>{plugin.author}</span>
                      <span>
                        {formatDownloads(plugin.downloads)}{" "}
                        {t("marketplace.downloads")}
                      </span>
                      <Show when={plugin.gameVersions?.length > 0}>
                        <span>
                          MC {plugin.gameVersions?.slice(-3).join(", ")}
                          {plugin.gameVersions?.length > 3 && "..."}
                        </span>
                      </Show>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  class="ml-4 flex items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent-600 active:scale-95 disabled:opacity-50"
                  onClick={() => install(plugin)}
                  disabled={installing() === plugin.id}
                >
                  <Show
                    when={installing() !== plugin.id}
                    fallback={<Loader2 size={14} class="animate-spin" />}
                  >
                    <Download size={14} />
                  </Show>
                  {t("marketplace.install")}
                </button>
              </div>
            )}
          </For>
        </div>
      </Show>

      <Show when={!loading() && results().length === 0 && query().trim()}>
        <div class="py-12 text-center text-sm text-surface-400">
          {t("marketplace.noResults")}
        </div>
      </Show>
    </div>
  );
};

export default Marketplace;
