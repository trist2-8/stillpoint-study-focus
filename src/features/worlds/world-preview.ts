import { create } from "zustand";
import { useApp } from "../../stores/app-store";
import { resolveWorld, type WorldAppearance } from "../focus/worlds";
export const useWorldPreview = create<{
  preview: Partial<WorldAppearance> | null;
  setPreview: (value: Partial<WorldAppearance> | null) => void;
}>((set) => ({ preview: null, setPreview: (preview) => set({ preview }) }));
export function useWorldAppearance() {
  const saved = useApp((state) => state.settings);
  const preview = useWorldPreview((state) => state.preview);
  const appearance = { ...saved, ...preview };
  return {
    ...appearance,
    world: resolveWorld(appearance.world, appearance.palette),
  };
}
export const openWorldGallery = () =>
  window.dispatchEvent(new Event("focus-flow:worlds"));
