import {
  emptyPersonal,
  validSubject,
  validJournal,
  validDistraction,
  goals,
} from "../features/personal/domain/personal-study";
import type { StudySubject, StudyGoal, SessionJournal } from "../types";
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
  appearanceSave: (
    appearance: Partial<
      Pick<
        UserSettings,
        | "world"
        | "favoriteWorlds"
        | "worldMotion"
        | "studyView"
        | "theme"
        | "palette"
      >
    >,
  ) => void;
  putSubject: (subject: StudySubject) => void;
  chooseSubject: (id: string | null) => void;
  chooseGoal: (goal: StudyGoal) => void;
  saveJournal: (journal: SessionJournal) => void;
  addDistraction: (text: string) => void;
  resolveDistraction: (id: string) => void;
}
export const useApp = create<Store>((set, get) => ({
  ...load(),
  toast: "",
  notify: (toast) => set({ toast }),
  timerAction: (action) => {
    get().tick();
    const { timer, settings, sessions } = get();
    if (action === "start") {
      const personal = get().personal ?? emptyPersonal;
      const task = get().tasks.find((item) => item.id === timer.currentTaskId);
      set({
        timer: start(
          timer.status === "IDLE"
            ? {
                ...timer,
                subjectId: task
                  ? (task.subjectId ?? null)
                  : personal.activeSubjectId,
                goal: personal.goal,
              }
            : timer,
        ),
      });
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
  selectTask: (id) => {
    const task = get().tasks.find((item) => item.id === id);
    if (!task) return;
    const personal = get().personal ?? emptyPersonal;
    set({
      timer: idle("FOCUS", get().settings, id),
      personal: { ...personal, activeSubjectId: task.subjectId ?? null },
    });
  },
  putSubject: (subject) => {
    if (!validSubject(subject)) throw new Error(tr("Môn học không hợp lệ."));
    const personal = get().personal ?? emptyPersonal;
    if (
      personal.subjects.some(
        (item) =>
          item.id !== subject.id &&
          item.name.trim().toLocaleLowerCase() ===
            subject.name.trim().toLocaleLowerCase(),
      )
    )
      throw new Error(tr("Môn học này đã có."));
    set({
      personal: {
        ...personal,
        subjects: personal.subjects.some((item) => item.id === subject.id)
          ? personal.subjects.map((item) =>
              item.id === subject.id ? subject : item,
            )
          : [...personal.subjects, subject],
      },
    });
  },
  chooseSubject: (id) => {
    const personal = get().personal ?? emptyPersonal;
    if (id !== null && !personal.subjects.some((subject) => subject.id === id))
      return;
    if (get().timer.status === "RUNNING" || get().timer.status === "PAUSED")
      return;
    const selectedTask = get().tasks.find(
      (task) => task.id === get().timer.currentTaskId,
    );
    const subject = personal.subjects.find((item) => item.id === id);
    set({
      personal: { ...personal, activeSubjectId: id },
      settings: subject
        ? { ...get().settings, scene: subject.scene }
        : get().settings,
      timer: idle(
        "FOCUS",
        get().settings,
        (selectedTask?.subjectId ?? null) === id
          ? (selectedTask?.id ?? null)
          : null,
      ),
    });
  },
  chooseGoal: (goal) => {
    if (
      !goals.includes(goal) ||
      get().timer.status === "RUNNING" ||
      get().timer.status === "PAUSED"
    )
      return;
    set({ personal: { ...(get().personal ?? emptyPersonal), goal } });
  },
  saveJournal: (journal) => {
    if (
      !validJournal(journal) ||
      !get().sessions.some(
        (session) =>
          session.id === journal.sessionId && session.type === "FOCUS",
      )
    )
      throw new Error(tr("Nhật ký không hợp lệ."));
    const personal = get().personal ?? emptyPersonal;
    set({
      personal: {
        ...personal,
        journals: [
          ...personal.journals.filter(
            (item) => item.sessionId !== journal.sessionId,
          ),
          journal,
        ],
      },
    });
  },
  addDistraction: (text) => {
    const personal = get().personal ?? emptyPersonal;
    const item = {
      id: crypto.randomUUID(),
      text: text.trim(),
      subjectId: personal.activeSubjectId,
      createdAt: Date.now(),
      resolved: false,
    };
    if (!validDistraction(item)) return;
    set({
      personal: { ...personal, distractions: [...personal.distractions, item] },
    });
  },
  resolveDistraction: (id) => {
    const personal = get().personal ?? emptyPersonal;
    set({
      personal: {
        ...personal,
        distractions: personal.distractions.map((item) =>
          item.id === id ? { ...item, resolved: !item.resolved } : item,
        ),
      },
    });
  },
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
        toast: tr(
          "Giờ hệ thống đã thay đổi. Đồng hồ đã tạm dừng; bạn có thể tiếp tục khi sẵn sàng.",
        ),
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
        subjectId:
          timer.subjectId !== undefined
            ? timer.subjectId
            : (tasks.find((task) => task.id === timer.currentTaskId)
                ?.subjectId ?? null),
        goal: timer.goal ?? "read",
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
        ? start(
            {
              ...idle(next, settings, timer.currentTaskId),
              subjectId: timer.subjectId,
              goal: timer.goal,
            },
            {
              now: () => completedAt,
            },
          )
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
      ? tr(
          "Bạn đã vắng mặt khá lâu. Vòng lặp đã tạm dừng; hãy kiểm tra tiến độ trước khi tiếp tục.",
        )
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
  appearanceSave: (appearance) => {
    const settings = { ...get().settings, ...appearance };
    if (!validSettings(settings))
      throw new Error(tr("Vui lòng nhập cài đặt hợp lệ."));
    set({ settings });
  },
  settingsSave: (settings) => {
    if (!validSettings(settings))
      throw new Error(tr("Vui lòng nhập cài đặt hợp lệ."));
    set({
      settings,
      timer:
        get().timer.status === "IDLE" &&
        (settings.focusDuration !== get().settings.focusDuration ||
          settings.shortBreakDuration !== get().settings.shortBreakDuration ||
          settings.longBreakDuration !== get().settings.longBreakDuration)
          ? idle(get().timer.mode, settings, get().timer.currentTaskId)
          : get().timer,
    });
  },
}));
useApp.subscribe((state, previous) => {
  if (
    state.personal === previous.personal &&
    state.timer === previous.timer &&
    state.tasks === previous.tasks &&
    state.sessions === previous.sessions &&
    state.settings === previous.settings
  )
    return;
  try {
    save({
      personal: state.personal,
      timer: state.timer,
      tasks: state.tasks,
      sessions: state.sessions,
      settings: state.settings,
    });
  } catch {
    if (!state.toast.includes(tr("Không thể lưu thay đổi")))
      state.notify(
        tr(
          "Không thể lưu thay đổi: bộ nhớ trình duyệt đã đầy hoặc không khả dụng.",
        ),
      );
  }
});
