import { Route, Router } from "@solidjs/router";
import { createSignal, lazy, onMount, Show } from "solid-js";
import { ToastContainer } from "./components/Toast";
import MainLayout from "./layouts/MainLayout";
import { verifyApiKey } from "./lib/api";
import { clearApiKey, getApiKey } from "./lib/auth";
import { I18nProvider } from "./lib/i18n";
import Login from "./pages/Login";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Plugins = lazy(() => import("./pages/Plugins"));
const Files = lazy(() => import("./pages/Files"));
const Users = lazy(() => import("./pages/Users"));
const Console = lazy(() => import("./pages/Console"));
const Marketplace = lazy(() => import("./pages/Marketplace"));

export default function App() {
  const [authed, setAuthed] = createSignal(false);
  const [checking, setChecking] = createSignal(true);

  onMount(async () => {
    const key = getApiKey();
    if (key) {
      try {
        const ok = await verifyApiKey(key);
        if (ok) {
          setAuthed(true);
        } else {
          clearApiKey();
        }
      } catch {
        clearApiKey();
      }
    }
    setChecking(false);
  });

  return (
    <I18nProvider>
      <Show when={!checking()}>
        <Show
          when={authed()}
          fallback={<Login onLogin={() => setAuthed(true)} />}
        >
          <Router root={MainLayout}>
            <Route path="/" component={Dashboard} />
            <Route path="/plugins" component={Plugins} />
            <Route path="/files" component={Files} />
            <Route path="/users" component={Users} />
            <Route path="/console" component={Console} />
            <Route path="/marketplace" component={Marketplace} />
          </Router>
        </Show>
      </Show>
      <ToastContainer />
    </I18nProvider>
  );
}
