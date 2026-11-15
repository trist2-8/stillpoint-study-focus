import { tr } from "../i18n";
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
  restore: (data: Data) => void;
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
    const snapshot = get();
    if (snapshot.timer.status !== "RUNNING") return;
    const now = clock.now();
    const { settings } = snapshot;
    let timer = snapshot.timer;
    if (timer.deadlineAt! > now + timer.durationMs) {
      set({
        timer: {
          ...timer,
          status: "PAUSED",
          remainingMs: timer.durationMs,
          deadlineAt: null,
          pausedAt: now,
        },
        toast:
          tr("Giờ hệ thống đã thay đổi. Đồng hồ đã tạm dừng; bạn có thể tiếp tục khi sẵn sàng."),
      });
      return;
    }
    if (timer.deadlineAt! > now) return;
    const sessions = [...snapshot.sessions];
    const recorded = new Set(sessions.map((session) => session.id));
    let completedFocus = sessions.filter(
      (session) => session.type === "FOCUS",
    ).length;
    let tasks = snapshot.tasks;
    let transitions = 0;
    let lastMode = timer.mode;
    while (
      timer.status === "RUNNING" &&
      timer.deadlineAt! <= now &&
      transitions < 1000
    ) {
      const finished = complete(timer, { now: () => now });
      if (recorded.has(timer.sessionId)) {
        timer = finished;
        break;
      }
      const completedAt = Math.max(timer.startedAt!, timer.deadlineAt!);
      sessions.push({
        id: timer.sessionId,
        taskId: timer.currentTaskId,
        type: timer.mode,
        status: "COMPLETED",
        startedAt: timer.startedAt!,
        completedAt,
        plannedDurationMs: timer.durationMs,
        actualDurationMs: timer.durationMs,
        dateKey: dateKey(completedAt),
      });
      recorded.add(timer.sessionId);
      lastMode = timer.mode;
      transitions += 1;
      if (timer.mode === "FOCUS") {
        completedFocus += 1;
        tasks = tasks.map((task) =>
          task.id === timer.currentTaskId
            ? {
                ...task,
                completedPomodoros: task.completedPomodoros + 1,
                updatedAt: completedAt,
              }
            : task,
        );
      }
      const next = nextMode(
        timer.mode,
        completedFocus,
        settings.longBreakInterval,
      );
      const auto =
        next === "FOCUS" ? settings.autoStartFocus : settings.autoStartBreaks;
      timer = auto
        ? start(idle(next, settings, timer.currentTaskId), {
            now: () => completedAt,
          })
        : finished;
    }
    const exceeded = timer.status === "RUNNING" && timer.deadlineAt! <= now;
    if (exceeded)
      timer = {
        ...idle(timer.mode, settings, timer.currentTaskId),
        status: "PAUSED",
        pausedAt: now,
      };
    const modeLabels: Record<Mode, string> = {
      FOCUS: tr("phiên tập trung"),
      SHORT_BREAK: tr("nghỉ ngắn"),
      LONG_BREAK: tr("nghỉ dài"),
    };
    const message = exceeded
      ? tr("Bạn đã vắng mặt khá lâu. Vòng lặp đã tạm dừng; hãy kiểm tra tiến độ trước khi tiếp tục.")
      : timer.status === "RUNNING"
        ? tr("Đã chuyển sang ") +
          modeLabels[timer.mode] +
          tr(". Vòng lặp đang tiếp tục.")
        : lastMode === "FOCUS"
          ? tr("Đã hoàn tất phiên tập trung. Bạn đã tiến thêm một bước.")
          : tr("Đã hết giờ nghỉ. Bạn đã sẵn sàng cho phiên học tiếp theo?");
    set({ sessions, tasks, timer, toast: message });
    if (!transitions) return;
    if (settings.soundEnabled) {
      const audio = new Audio(
        new URL("../../assets/chime.wav", import.meta.url).href,
      );
      void audio
        .play()
        .catch(() =>
          get().notify(tr("Đã chuyển phiên. Trình duyệt đã chặn âm thanh.")),
        );
    }
    if (
      settings.notificationEnabled &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        new Notification("Focus Flow", { body: message });
      } catch {
        get().notify(message);
      }
    }
  },
  putTask: (task) => {
    if (!validTask(task)) throw new Error(tr("Việc học không hợp lệ"));
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
  restore: (data) => set(data),
  settingsSave: (settings) => {
    if (!validSettings(settings))
      throw new Error(tr("Vui lòng nhập cài đặt hợp lệ."));
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
    if (!state.toast.includes(tr("Không thể lưu thay đổi")))
      state.notify(
        tr("Không thể lưu thay đổi: bộ nhớ trình duyệt đã đầy hoặc không khả dụng."),
      );
  }
});
