import { KeyRound, Loader2 } from "lucide-solid";
import { type Component, createSignal } from "solid-js";
import { addToast } from "../components/Toast";
import { verifyApiKey } from "../lib/api";
import { setApiKey } from "../lib/auth";
import { useI18n } from "../lib/i18n";

const Login: Component<{ onLogin: () => void }> = (props) => {
  const { t } = useI18n();
  const [key, setKey] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const k = key().trim();
    if (!k) return;

    setLoading(true);
    try {
      const ok = await verifyApiKey(k);
      if (ok) {
        setApiKey(k);
        addToast(t("login.authenticated"), true);
        props.onLogin();
      } else {
        addToast(t("login.invalid"), false);
      }
    } catch {
      addToast(t("login.failed"), false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="flex min-h-screen items-center justify-center bg-surface-50 dark:bg-surface-950">
      <div class="w-full max-w-sm rounded-2xl border border-surface-200 bg-white p-8 shadow-lg dark:border-surface-800 dark:bg-surface-900">
        <div class="mb-6 text-center">
          <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500/10">
            <KeyRound size={24} class="text-accent-500" />
          </div>
          <h1 class="text-xl font-bold text-surface-900 dark:text-surface-100">
            {t("login.title")}
          </h1>
          <p class="mt-1 text-sm text-surface-500">{t("login.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} class="space-y-4">
          <input
            type="password"
            placeholder={t("login.placeholder")}
            class="w-full rounded-xl border border-surface-300 bg-surface-50 px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-surface-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-surface-700 dark:bg-surface-950 dark:placeholder:text-surface-600 dark:focus:border-accent-400"
            value={key()}
            onInput={(e) => setKey(e.currentTarget.value)}
            autofocus
          />

          <button
            type="submit"
            disabled={loading() || !key().trim()}
            class="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading() ? (
              <Loader2 size={16} class="animate-spin" />
            ) : (
              t("login.button")
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
