import { create } from "zustand";
import {
  load,
  save,
  validSettings,
  validTask,
  type Data,
} from "../services/storage";
import {
  clock,
  complete,
  idle,
  nextMode,
  pause,
  start,
} from "../features/focus/domain/timer-engine";
import { dateKey } from "../features/analytics/domain/analytics-calculations";
import type { Mode, StudyTask, UserSettings } from "../types";
interface Store extends Data {
  toast: string;
  notify: (message: string) => void;
  timerAction: (action: "start" | "pause" | "reset" | "skip" | "next") => void;
  tick: () => void;
  setMode: (mode: Mode) => void;
  selectTask: (id: string) => void;
  putTask: (task: StudyTask) => void;
  deleteTask: (id: string) => void;
  settingsSave: (settings: UserSettings) => void;
}
export const useApp = create<Store>((set, get) => ({
  ...load(),
  toast: "",
  notify: (toast) => set({ toast }),
  timerAction: (action) => {
    get().tick();
    const { timer, settings, sessions } = get();
    if (action === "start") {
      set({ timer: start(timer) });
      return;
    }
    if (action === "pause") {
      set({ timer: pause(timer) });
      return;
    }
    const mode =
      action === "reset"
        ? timer.mode
        : nextMode(
            timer.mode,
            sessions.filter((s) => s.type === "FOCUS").length,
            settings.longBreakInterval,
          );
    set({ timer: idle(mode, settings, timer.currentTaskId) });
  },
  setMode: (mode) => {
    get().tick();
    set({ timer: idle(mode, get().settings, get().timer.currentTaskId) });
  },
  selectTask: (id) => set({ timer: idle("FOCUS", get().settings, id) }),
  tick: () => {
    const { timer, settings, sessions, tasks } = get();
    if (timer.status !== "RUNNING") return;
    const now = clock.now();
    if (timer.deadlineAt! > now + timer.durationMs) {
      set({
        timer: {
          ...timer,
          status: "PAUSED",
          remainingMs: timer.durationMs,
          deadlineAt: null,
          pausedAt: now,
        },
        toast: "Your clock changed. The timer is paused; resume when ready.",
      });
      return;
    }
    const finished = complete(timer);
    if (finished.status !== "COMPLETED") return;
    if (sessions.some((s) => s.id === timer.sessionId)) {
      set({ timer: finished });
      return;
    }
    const completedAt = Math.max(timer.startedAt!, timer.deadlineAt!);
    const record = {
      id: timer.sessionId,
      taskId: timer.currentTaskId,
      type: timer.mode,
      status: "COMPLETED" as const,
      startedAt: timer.startedAt!,
      completedAt,
      plannedDurationMs: timer.durationMs,
      actualDurationMs: timer.durationMs,
      dateKey: dateKey(completedAt),
    };
    const updated = [...sessions, record];
    const next = nextMode(
      timer.mode,
      updated.filter((s) => s.type === "FOCUS").length,
      settings.longBreakInterval,
    );
    const auto =
      next === "FOCUS" ? settings.autoStartFocus : settings.autoStartBreaks;
    set({
      sessions: updated,
      tasks:
        timer.mode === "FOCUS"
          ? tasks.map((t) =>
              t.id === timer.currentTaskId
                ? {
                    ...t,
                    completedPomodoros: t.completedPomodoros + 1,
                    updatedAt: now,
                  }
                : t,
            )
          : tasks,
      timer: auto ? start(idle(next, settings, timer.currentTaskId)) : finished,
      toast:
        timer.mode === "FOCUS"
          ? "A little more progress. Focus session complete."
          : "Break complete. Ready for a fresh start?",
    });
    if (settings.soundEnabled) {
      const audio = new Audio(
        new URL("../../assets/chime.wav", import.meta.url).href,
      );
      void audio
        .play()
        .catch(() =>
          get().notify("Session complete. Sound was blocked by your browser."),
        );
    }
    if (
      settings.notificationEnabled &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        new Notification("Focus Flow", { body: "Your session is complete." });
      } catch {
        /* In-app completion remains available. */
      }
    }
  },
  putTask: (task) => {
    if (!validTask(task)) throw new Error("Invalid task");
    set({
      tasks: get().tasks.some((t) => t.id === task.id)
        ? get().tasks.map((t) => (t.id === task.id ? task : t))
        : [...get().tasks, task],
    });
  },
  deleteTask: (id) =>
    set({
      tasks: get().tasks.filter((t) => t.id !== id),
      timer:
        get().timer.currentTaskId === id
          ? { ...get().timer, currentTaskId: null }
          : get().timer,
    }),
  settingsSave: (settings) => {
    if (!validSettings(settings))
      throw new Error("Please enter valid settings.");
    set({
      settings,
      timer:
        get().timer.status === "IDLE"
          ? idle(get().timer.mode, settings, get().timer.currentTaskId)
          : get().timer,
    });
  },
}));
useApp.subscribe((state, previous) => {
  if (
    state.timer === previous.timer &&
    state.tasks === previous.tasks &&
    state.sessions === previous.sessions &&
    state.settings === previous.settings
  )
    return;
  try {
    save({
      timer: state.timer,
      tasks: state.tasks,
      sessions: state.sessions,
      settings: state.settings,
    });
  } catch {
    if (!state.toast.includes("saved"))
      state.notify(
        "Changes could not be saved. Browser storage may be full or unavailable.",
      );
  }
});
