import type { UserSettings } from "../../types";

export function applyAppearance(
  settings: Pick<UserSettings, "theme" | "palette">,
) {
  const theme =
    settings.theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : settings.theme;
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.palette = settings.palette ?? "lavender";
  document.documentElement.style.colorScheme = theme;
}
