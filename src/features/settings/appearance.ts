import type { UserSettings } from "../../types";
import { resolveWorld, worldTokens } from "../focus/worlds";
export function applyAppearance(
  settings: Pick<
    UserSettings,
    "theme" | "palette" | "world" | "worldMotion" | "studyView"
  >,
) {
  const mode =
    settings.theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : settings.theme;
  const world = resolveWorld(settings.world, settings.palette);
  const element = document.documentElement;
  element.dataset.theme = mode;
  element.dataset.palette = settings.palette ?? "lavender";
  element.dataset.world = world;
  element.dataset.worldMotion = settings.worldMotion === false ? "off" : "on";
  element.dataset.studyView = settings.studyView ?? "world";
  element.style.colorScheme = mode;
  for (const [key, value] of Object.entries(worldTokens(world, mode)))
    element.style.setProperty(key, value);
}
