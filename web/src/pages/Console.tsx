import { ArrowDown, Send, Trash, Wifi, WifiOff } from "lucide-solid";
import {
  type Component,
  createEffect,
  createSignal,
  For,
  type JSX,
  on,
  onCleanup,
  onMount,
} from "solid-js";
import { getApiKey } from "../lib/auth";
import { useI18n } from "../lib/i18n";

const ANSI_16_COLORS: Record<number, string> = {
  30: "#000",
  31: "#AA0000",
  32: "#00AA00",
  33: "#AA5500",
  34: "#0000AA",
  35: "#AA00AA",
  36: "#00AAAA",
  37: "#AAAAAA",
  90: "#555555",
  91: "#FF5555",
  92: "#55FF55",
  93: "#FFFF55",
  94: "#5555FF",
  95: "#FF55FF",
  96: "#55FFFF",
  97: "#FFFFFF",
};

const MC_COLORS: Record<string, string> = {
  "0": "#000000",
  "1": "#0000AA",
  "2": "#00AA00",
  "3": "#00AAAA",
  "4": "#AA0000",
  "5": "#AA00AA",
  "6": "#FFAA00",
  "7": "#AAAAAA",
  "8": "#555555",
  "9": "#5555FF",
  a: "#55FF55",
  b: "#55FFFF",
  c: "#FF5555",
  d: "#FF55FF",
  e: "#FFFF55",
  f: "#FFFFFF",
};

function parseColors(text: string): JSX.Element {
  // Combined regex: ANSI escape codes (with or without ESC char) and Minecraft § codes
  // biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI escape codes require matching control characters
  const regex = /(?:\x1b|\u001b)?\[([0-9;]*)m|§([0-9a-fk-or])/gi;
  const parts: JSX.Element[] = [];
  let lastIndex = 0;
  let color: string | null = null;
  let bold = false;
  let italic = false;
  let underline = false;
  let strikethrough = false;

  const makeStyle = (): Record<string, string> => {
    const s: Record<string, string> = {};
    if (color) s.color = color;
    if (bold) s["font-weight"] = "bold";
    if (italic) s["font-style"] = "italic";
    const deco: string[] = [];
    if (underline) deco.push("underline");
    if (strikethrough) deco.push("line-through");
    if (deco.length) s["text-decoration"] = deco.join(" ");
    return s;
  };

  const resetAll = () => {
    color = null;
    bold = false;
    italic = false;
    underline = false;
    strikethrough = false;
  };

  let match: RegExpExecArray | null = regex.exec(text);
  while (match !== null) {
    if (match.index > lastIndex) {
      const seg = text.slice(lastIndex, match.index);
      parts.push(<span style={makeStyle()}>{seg}</span>);
    }

    if (match[1] !== undefined) {
      // ANSI escape
      const codes = match[1].split(";").map(Number);
      for (let i = 0; i < codes.length; i++) {
        const c = codes[i];
        if (c === 0) resetAll();
        else if (c === 1) bold = true;
        else if (c === 3) italic = true;
        else if (c === 4) underline = true;
        else if (c === 9) strikethrough = true;
        else if (ANSI_16_COLORS[c]) color = ANSI_16_COLORS[c];
        else if (c === 38 && codes[i + 1] === 2) {
          // 24-bit: 38;2;R;G;B
          const r = codes[i + 2],
            g = codes[i + 3],
            b = codes[i + 4];
          if (r !== undefined && g !== undefined && b !== undefined) {
            color = `rgb(${r},${g},${b})`;
          }
          i += 4;
        } else if (c === 39) color = null;
      }
    } else if (match[2] !== undefined) {
      // Minecraft §
      const mc = match[2].toLowerCase();
      if (MC_COLORS[mc]) color = MC_COLORS[mc];
      else if (mc === "l") bold = true;
      else if (mc === "o") italic = true;
      else if (mc === "n") underline = true;
      else if (mc === "m") strikethrough = true;
      else if (mc === "r") resetAll();
    }

    lastIndex = regex.lastIndex;
    match = regex.exec(text);
  }

  if (lastIndex < text.length) {
    parts.push(<span style={makeStyle()}>{text.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : text;
}

const Console: Component = () => {
  const { t } = useI18n();
  const [logs, setLogs] = createSignal<string[]>([]);
  const [command, setCommand] = createSignal("");
  const [connected, setConnected] = createSignal(false);
  const [autoScroll, setAutoScroll] = createSignal(true);

  let ws: WebSocket | null = null;
  let logContainer: HTMLDivElement | undefined;
  let reconnectTimer: number | undefined;

  const connect = () => {
    if (ws?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const token = getApiKey();
    const qs = token ? `?token=${encodeURIComponent(token)}` : "";
    const url = `${protocol}//${window.location.host}/api/console${qs}`;

    ws = new WebSocket(url);

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onmessage = (e) => {
      setLogs((prev) => {
        const next = [...prev, e.data];
        if (next.length > 5000) return next.slice(-3000);
        return next;
      });
    };

    ws.onclose = () => {
      setConnected(false);
      ws = null;
      reconnectTimer = window.setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws?.close();
    };
  };

  onMount(() => {
    connect();
  });

  onCleanup(() => {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    ws?.close();
  });

  createEffect(
    on(logs, () => {
      if (autoScroll() && logContainer) {
        requestAnimationFrame(() => {
          if (logContainer) {
            logContainer.scrollTop = logContainer.scrollHeight;
          }
        });
      }
    }),
  );

  const handleScroll = () => {
    if (!logContainer) return;
    const { scrollTop, scrollHeight, clientHeight } = logContainer;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 40);
  };

  const scrollToBottom = () => {
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight;
      setAutoScroll(true);
    }
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const cmd = command().trim();
    if (!cmd || !ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(cmd);
    setCommand("");
  };

  const lineClass = (line: string) => {
    if (
      line.includes(" WARN]") ||
      line.includes(" WARN :") ||
      line.includes(" WARN]:")
    )
      return "text-yellow-400";
    if (
      line.includes(" ERROR]") ||
      line.includes(" ERROR:") ||
      line.includes(" ERROR]:")
    )
      return "text-red-400";
    return "text-gray-200";
  };

  return (
    <div class="flex h-[calc(100vh-4rem)] flex-col space-y-4 lg:space-y-6">
      <div>
        <h1 class="text-2xl font-bold">{t("console.title")}</h1>
        <p class="mt-1 text-sm text-surface-500">{t("console.subtitle")}</p>
      </div>

      <div class="flex flex-1 flex-col overflow-hidden rounded-2xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900">
        <div class="flex items-center justify-between border-b border-surface-200 px-4 py-2.5 dark:border-surface-800">
          <div class="flex items-center gap-2">
            {connected() ? (
              <>
                <Wifi size={14} class="text-green-500" />
                <span class="text-sm font-medium text-green-600 dark:text-green-400">
                  {t("console.connected")}
                </span>
              </>
            ) : (
              <>
                <WifiOff size={14} class="text-surface-400" />
                <span class="text-sm font-medium text-surface-500">
                  {t("console.disconnected")}
                </span>
              </>
            )}
          </div>
          <div class="flex gap-1">
            <button
              type="button"
              onClick={() => setLogs([])}
              class="whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:hover:bg-surface-800 dark:hover:text-white"
            >
              <span class="flex items-center gap-1">
                <Trash size={12} /> {t("console.clear")}
              </span>
            </button>
            <button
              type="button"
              onClick={scrollToBottom}
              class="whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:hover:bg-surface-800 dark:hover:text-white"
            >
              <span class="flex items-center gap-1">
                <ArrowDown size={12} /> {t("console.bottom")}
              </span>
            </button>
          </div>
        </div>

        <div
          ref={logContainer}
          onScroll={handleScroll}
          class="flex-1 overflow-y-auto bg-black p-4 font-mono text-[13px] leading-relaxed text-gray-200"
        >
          <For each={logs()}>
            {(line) => (
              <div class={`py-0.5 ${lineClass(line)}`}>{parseColors(line)}</div>
            )}
          </For>
        </div>
      </div>

      <form onSubmit={handleSubmit} class="flex gap-2">
        <input
          type="text"
          placeholder={t("console.placeholder")}
          class="flex-1 rounded-xl border border-surface-300 bg-white px-4 py-2.5 font-mono text-sm outline-none transition-colors placeholder:text-surface-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-surface-700 dark:bg-surface-900 dark:placeholder:text-surface-600 dark:focus:border-accent-400"
          value={command()}
          onInput={(e) => setCommand(e.currentTarget.value)}
          disabled={!connected()}
        />
        <button
          type="submit"
          disabled={!connected()}
          class="rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span class="flex items-center gap-1.5">
            <Send size={14} /> {t("console.send")}
          </span>
        </button>
      </form>
    </div>
  );
};

export default Console;
