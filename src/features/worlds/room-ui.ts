import { create } from "zustand";
export const useRoomUi = create<{ quiet: boolean; toggleQuiet: () => void }>(
  (set) => ({
    quiet: false,
    toggleQuiet: () => set((state) => ({ quiet: !state.quiet })),
  }),
);
