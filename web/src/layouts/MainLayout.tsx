import type { Component, JSX } from "solid-js";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  children: JSX.Element;
}

const MainLayout: Component<MainLayoutProps> = (props) => {
  return (
    <div class="flex min-h-screen bg-surface-50 text-surface-900 dark:bg-surface-950 dark:text-surface-100">
      <Sidebar />
      <main class="flex-1 overflow-y-auto p-8">{props.children}</main>
    </div>
  );
};

export default MainLayout;
