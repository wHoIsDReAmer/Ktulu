import { Menu, X } from "lucide-solid";
import { type Component, createSignal, type JSX, Show } from "solid-js";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  children: JSX.Element;
}

const MainLayout: Component<MainLayoutProps> = (props) => {
  const [open, setOpen] = createSignal(false);

  return (
    <div class="flex h-screen bg-surface-50 text-surface-900 dark:bg-surface-950 dark:text-surface-100">
      {/* Desktop sidebar */}
      <div class="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      <Show when={open()}>
        <div class="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            tabIndex={-1}
            class="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div class="relative z-50 h-full w-60">
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      </Show>

      <div class="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header class="flex items-center gap-3 border-b border-surface-200 px-4 py-3 lg:hidden dark:border-surface-800">
          <button
            type="button"
            onClick={() => setOpen(!open())}
            class="rounded-lg p-1.5 text-surface-600 transition-colors hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
          >
            {open() ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span class="text-lg font-bold tracking-tight text-accent-600 dark:text-accent-400">
            Ktulu
          </span>
        </header>

        <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {props.children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
