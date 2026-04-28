import { A } from "@solidjs/router";
import {
  BarChart3,
  FileText,
  Globe,
  Moon,
  Plug,
  Store,
  Sun,
  Terminal,
  Users,
} from "lucide-solid";
import { type Component, For, type JSX } from "solid-js";
import { type Locale, useI18n } from "../lib/i18n";
import { useTheme } from "../lib/theme";

interface NavItem {
  path: string;
  labelKey: string;
  icon: () => JSX.Element;
}

const navItems: NavItem[] = [
  {
    path: "/",
    labelKey: "sidebar.dashboard",
    icon: () => <BarChart3 size={18} />,
  },
  {
    path: "/plugins",
    labelKey: "sidebar.plugins",
    icon: () => <Plug size={18} />,
  },
  {
    path: "/marketplace",
    labelKey: "sidebar.marketplace",
    icon: () => <Store size={18} />,
  },
  {
    path: "/files",
    labelKey: "sidebar.files",
    icon: () => <FileText size={18} />,
  },
  {
    path: "/users",
    labelKey: "sidebar.users",
    icon: () => <Users size={18} />,
  },
  {
    path: "/console",
    labelKey: "sidebar.console",
    icon: () => <Terminal size={18} />,
  },
];

const localeLabels: Record<Locale, string> = {
  en: "EN",
  ko: "KO",
};

const Sidebar: Component<{ onNavigate?: () => void }> = (props) => {
  const { theme, toggle } = useTheme();
  const { t, locale, setLocale } = useI18n();

  const cycleLocale = () => {
    setLocale(locale() === "en" ? "ko" : "en");
  };

  return (
    <aside class="flex h-screen w-60 flex-col border-r border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900">
      <div class="flex items-center gap-2.5 px-5 py-6">
        <img src="/logo.png" alt="Ktulu" class="h-8 w-8" />
        <h1 class="text-xl font-bold tracking-tight text-accent-600 dark:text-accent-400">
          Ktulu
        </h1>
      </div>

      <nav class="flex-1 space-y-1 px-3">
        <For each={navItems}>
          {(item) => (
            <A
              href={item.path}
              class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-white"
              activeClass="!bg-accent-500/10 !text-accent-600 dark:!text-accent-400"
              end={item.path === "/"}
              onClick={() => props.onNavigate?.()}
            >
              {item.icon()}
              {t(item.labelKey)}
            </A>
          )}
        </For>
      </nav>

      <div class="space-y-1 border-t border-surface-200 p-3 dark:border-surface-800">
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
          onClick={cycleLocale}
        >
          <Globe size={18} />
          {localeLabels[locale()]}
        </button>
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
          onClick={toggle}
        >
          {theme() === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          {theme() === "dark" ? t("sidebar.lightMode") : t("sidebar.darkMode")}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
