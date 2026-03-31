import { Route, Router } from "@solidjs/router";
import { lazy } from "solid-js";
import MainLayout from "./layouts/MainLayout";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Plugins = lazy(() => import("./pages/Plugins"));
const Files = lazy(() => import("./pages/Files"));
const Users = lazy(() => import("./pages/Users"));
const Console = lazy(() => import("./pages/Console"));
const Marketplace = lazy(() => import("./pages/Marketplace"));

export default function App() {
  return (
    <Router root={MainLayout}>
      <Route path="/" component={Dashboard} />
      <Route path="/plugins" component={Plugins} />
      <Route path="/files" component={Files} />
      <Route path="/users" component={Users} />
      <Route path="/console" component={Console} />
      <Route path="/marketplace" component={Marketplace} />
    </Router>
  );
}
