import { A } from "@solidjs/router";
import {
  BarChart3,
  FileText,
  Moon,
  Plug,
  Sun,
  Terminal,
  Users,
  Zap,
} from "lucide-solid";
import { type Component, For, type JSX } from "solid-js";
import { useTheme } from "../lib/theme";

interface NavItem {
  path: string;
  label: string;
  icon: () => JSX.Element;
}

const navItems: NavItem[] = [
  { path: "/", label: "Dashboard", icon: () => <BarChart3 size={18} /> },
  { path: "/plugins", label: "Plugins", icon: () => <Plug size={18} /> },
  { path: "/files", label: "Files", icon: () => <FileText size={18} /> },
  { path: "/users", label: "Users", icon: () => <Users size={18} /> },
  { path: "/console", label: "Console", icon: () => <Terminal size={18} /> },
];

const Sidebar: Component = () => {
  const { theme, toggle } = useTheme();

  return (
    <aside class="flex h-screen w-60 flex-col border-r border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900">
      <div class="flex items-center gap-2.5 px-5 py-6">
        <Zap size={22} class="text-accent-500" />
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
            >
              {item.icon()}
              {item.label}
            </A>
          )}
        </For>
      </nav>

      <div class="border-t border-surface-200 p-3 dark:border-surface-800">
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
          onClick={toggle}
        >
          {theme() === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          {theme() === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
