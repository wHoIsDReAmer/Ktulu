import { ArrowDown, ChevronRight, Send, Trash } from "lucide-solid";
import { type Component, createSignal, For } from "solid-js";

interface LogEntry {
  time: string;
  level: "INFO" | "WARN" | "ERROR";
  message: string;
}

const mockLogs: LogEntry[] = [
  { time: "12:00:01", level: "INFO", message: "Server started on port 25565" },
  { time: "12:00:02", level: "INFO", message: "Loading world [world]" },
  { time: "12:00:03", level: "INFO", message: "Preparing spawn area: 52%" },
  {
    time: "12:00:04",
    level: "INFO",
    message: 'Done (3.245s)! For help, type "help"',
  },
  { time: "12:01:15", level: "INFO", message: "Steve joined the game" },
  {
    time: "12:02:30",
    level: "WARN",
    message: "Can't keep up! Is the server overloaded?",
  },
  { time: "12:03:00", level: "INFO", message: "Alex joined the game" },
  {
    time: "12:05:12",
    level: "ERROR",
    message: "Failed to handle packet for Steve",
  },
];

const levelStyles = {
  INFO: "text-surface-500 dark:text-surface-400",
  WARN: "text-yellow-600 dark:text-yellow-400",
  ERROR: "text-red-500 dark:text-red-400",
};

const Console: Component = () => {
  const [logs] = createSignal(mockLogs);
  const [command, setCommand] = createSignal("");

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!command().trim()) return;
    setCommand("");
  };

  return (
    <div class="flex h-[calc(100vh-4rem)] flex-col space-y-6">
      <div>
        <h1 class="text-2xl font-bold">Console</h1>
        <p class="mt-1 text-sm text-surface-500">
          Real-time server logs and command execution
        </p>
      </div>

      <div class="flex-1 overflow-hidden rounded-2xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900">
        <div class="flex items-center justify-between border-b border-surface-200 px-4 py-2.5 dark:border-surface-800">
          <div class="flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full bg-green-500" />
            <span class="text-sm font-medium text-surface-500">Server Log</span>
          </div>
          <div class="flex gap-1">
            <button
              type="button"
              class="rounded-lg px-2.5 py-1 text-xs font-medium text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:hover:bg-surface-800 dark:hover:text-white"
            >
              <span class="flex items-center gap-1">
                <Trash size={12} /> Clear
              </span>
            </button>
            <button
              type="button"
              class="rounded-lg px-2.5 py-1 text-xs font-medium text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:hover:bg-surface-800 dark:hover:text-white"
            >
              <span class="flex items-center gap-1">
                <ArrowDown size={12} /> Bottom
              </span>
            </button>
          </div>
        </div>

        <div class="h-full overflow-y-auto bg-surface-50 p-4 font-mono text-[13px] leading-relaxed dark:bg-surface-950">
          <For each={logs()}>
            {(log) => (
              <div class="py-0.5">
                <span class="text-surface-400 dark:text-surface-600">
                  [{log.time}]
                </span>{" "}
                <span class={`font-semibold ${levelStyles[log.level]}`}>
                  [{log.level}]
                </span>{" "}
                <span class="text-surface-700 dark:text-surface-300">
                  {log.message}
                </span>
              </div>
            )}
          </For>
        </div>
      </div>

      <form onSubmit={handleSubmit} class="flex gap-2">
        <div class="flex items-center rounded-xl border border-surface-300 bg-white px-3 dark:border-surface-700 dark:bg-surface-900">
          <ChevronRight size={16} class="text-surface-400" />
        </div>
        <input
          type="text"
          placeholder="Enter command..."
          class="flex-1 rounded-xl border border-surface-300 bg-white px-4 py-2.5 font-mono text-sm outline-none transition-colors placeholder:text-surface-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-surface-700 dark:bg-surface-900 dark:placeholder:text-surface-600 dark:focus:border-accent-400"
          value={command()}
          onInput={(e) => setCommand(e.currentTarget.value)}
        />
        <button
          type="submit"
          class="rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent-600 active:scale-95"
        >
          <span class="flex items-center gap-1.5">
            <Send size={14} /> Send
          </span>
        </button>
      </form>
    </div>
  );
};

export default Console;
