import { AlertTriangle, Loader2 } from "lucide-solid";
import { type Component, createSignal, Show } from "solid-js";
import { Portal } from "solid-js/web";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

const ConfirmModal: Component<ConfirmModalProps> = (props) => {
  const [loading, setLoading] = createSignal(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await props.onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="mx-4 w-full max-w-sm rounded-2xl border border-surface-200 bg-white p-6 shadow-xl dark:border-surface-700 dark:bg-surface-900">
          <div class="flex items-start gap-3">
            <Show when={props.danger}>
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50">
                <AlertTriangle size={20} class="text-red-500" />
              </div>
            </Show>
            <div>
              <h3 class="text-base font-semibold text-surface-900 dark:text-surface-100">
                {props.title}
              </h3>
              <p class="mt-1 text-sm text-surface-500">{props.message}</p>
            </div>
          </div>
          <div class="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={props.onCancel}
              disabled={loading()}
              class="rounded-xl border border-surface-300 px-4 py-2 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 active:scale-95 dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading()}
              class={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-white transition-all active:scale-95 disabled:opacity-50 ${
                props.danger
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-accent-500 hover:bg-accent-600"
              }`}
            >
              {loading() && <Loader2 size={14} class="animate-spin" />}
              {props.confirmLabel ?? "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default ConfirmModal;
