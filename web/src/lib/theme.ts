import { createSignal } from "solid-js";

const getInitialTheme = (): "dark" | "light" => {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("ktulu-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const [theme, setThemeSignal] = createSignal<"dark" | "light">(
  getInitialTheme(),
);

const applyTheme = (t: "dark" | "light") => {
  document.documentElement.classList.toggle("dark", t === "dark");
  localStorage.setItem("ktulu-theme", t);
};

applyTheme(getInitialTheme());

export const useTheme = () => ({
  theme,
  toggle: () => {
    const next = theme() === "dark" ? "light" : "dark";
    setThemeSignal(next);
    applyTheme(next);
  },
});
