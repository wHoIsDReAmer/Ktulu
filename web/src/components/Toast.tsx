import { Check, X } from "lucide-solid";
import { createSignal, For } from "solid-js";
import { Portal } from "solid-js/web";

interface ToastItem {
  id: number;
  message: string;
  ok: boolean;
  leaving: boolean;
}

let toastId = 0;

const [toasts, setToasts] = createSignal<ToastItem[]>([]);

export function addToast(message: string, ok: boolean) {
  const id = ++toastId;
  setToasts((prev) => [...prev, { id, message, ok, leaving: false }]);
  setTimeout(() => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, 3000);
}

export function ToastContainer() {
  return (
    <Portal>
      <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <For each={toasts()}>
          {(toast) => (
            <div
              class={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-lg ${
                toast.ok ? "bg-green-600" : "bg-red-600"
              } ${toast.leaving ? "animate-toast-out" : "animate-toast-in"}`}
            >
              {toast.ok ? <Check size={16} /> : <X size={16} />}
              {toast.message}
            </div>
          )}
        </For>
      </div>
    </Portal>
  );
}
