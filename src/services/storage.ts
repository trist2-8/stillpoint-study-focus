import {
  defaults,
  type UserSettings,
  type StudyTask,
  type FocusSession,
  type TimerState,
} from "../types";
import { idle } from "../features/focus/domain/timer-engine";
export const STORAGE_KEY = "focus-flow";
export interface Data {
  settings: UserSettings;
  tasks: StudyTask[];
  sessions: FocusSession[];
  timer: TimerState;
}
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object";
const finite = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v) && v >= 0;
export function validSettings(v: unknown): v is UserSettings {
  if (
    object(v) &&
    v.companionEnabled !== undefined &&
    typeof v.companionEnabled !== "boolean"
  )
    return false;
  if (!object(v) || !["light", "dark", "system"].includes(String(v.theme)))
    return false;
  return (
    ["focusDuration", "shortBreakDuration", "longBreakDuration"].every(
      (k) => finite(v[k]) && Number.isInteger(v[k]) && v[k] >= 1 && v[k] <= 180,
    ) &&
    ["longBreakInterval", "dailyFocusGoal", "dailySessionGoal"].every(
      (k) =>
        finite(v[k]) && Number.isInteger(v[k]) && v[k] >= 1 && v[k] <= 1440,
    ) &&
    (v.longBreakInterval as number) <= 12 &&
    (v.dailySessionGoal as number) <= 100 &&
    [
      "autoStartBreaks",
      "autoStartFocus",
      "soundEnabled",
      "notificationEnabled",
    ].every((k) => typeof v[k] === "boolean")
  );
}
export function validTask(v: unknown): v is StudyTask {
  return (
    object(v) &&
    typeof v.id === "string" &&
    typeof v.title === "string" &&
    v.title.trim().length > 0 &&
    v.title.length <= 160 &&
    typeof v.description === "string" &&
    v.description.length <= 2000 &&
    ["low", "medium", "high"].includes(String(v.priority)) &&
    finite(v.estimatedPomodoros) &&
    Number.isInteger(v.estimatedPomodoros) &&
    v.estimatedPomodoros >= 1 &&
    v.estimatedPomodoros <= 100 &&
    finite(v.completedPomodoros) &&
    Number.isInteger(v.completedPomodoros) &&
    typeof v.isCompleted === "boolean" &&
    finite(v.createdAt) &&
    finite(v.updatedAt) &&
    (v.dueAt === null ||
      (typeof v.dueAt === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v.dueAt)))
  );
}
function validSession(v: unknown): v is FocusSession {
  return (
    object(v) &&
    typeof v.id === "string" &&
    (v.taskId === null || typeof v.taskId === "string") &&
    ["FOCUS", "SHORT_BREAK", "LONG_BREAK"].includes(String(v.type)) &&
    v.status === "COMPLETED" &&
    finite(v.startedAt) &&
    finite(v.completedAt) &&
    v.completedAt >= v.startedAt &&
    finite(v.plannedDurationMs) &&
    v.plannedDurationMs > 0 &&
    finite(v.actualDurationMs) &&
    v.actualDurationMs <= v.plannedDurationMs &&
    typeof v.dateKey === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(v.dateKey)
  );
}
function validTimer(v: unknown): v is TimerState {
  return (
    object(v) &&
    ["FOCUS", "SHORT_BREAK", "LONG_BREAK"].includes(String(v.mode)) &&
    ["IDLE", "RUNNING", "PAUSED", "COMPLETED"].includes(String(v.status)) &&
    finite(v.durationMs) &&
    v.durationMs >= 60000 &&
    v.durationMs <= 10800000 &&
    finite(v.remainingMs) &&
    v.remainingMs <= v.durationMs &&
    typeof v.sessionId === "string" &&
    (v.currentTaskId === null || typeof v.currentTaskId === "string") &&
    (v.startedAt === null || finite(v.startedAt)) &&
    (v.pausedAt === null || finite(v.pausedAt)) &&
    (v.deadlineAt === null || finite(v.deadlineAt)) &&
    (v.status !== "RUNNING" || (finite(v.deadlineAt) && finite(v.startedAt)))
  );
}
export function decode(raw: string | null): Data {
  const fallback = {
    settings: { ...defaults },
    tasks: [],
    sessions: [],
    timer: idle("FOCUS", defaults),
  };
  try {
    const envelope: unknown = JSON.parse(raw ?? "null");
    if (!object(envelope)) return fallback;
    /* v0 used the same data shape without an envelope. */ const data =
      envelope.version === 0
        ? envelope
        : envelope.version === 1
          ? envelope.data
          : null;
    if (!object(data)) return fallback;
    const settings = validSettings(data.settings)
      ? data.settings
      : fallback.settings;
    const tasks = Array.isArray(data.tasks) ? data.tasks.filter(validTask) : [];
    const sessions = Array.isArray(data.sessions)
      ? Array.from(
          new Map(
            data.sessions.filter(validSession).map((s) => [s.id, s]),
          ).values(),
        )
      : [];
    let timer = validTimer(data.timer) ? data.timer : idle("FOCUS", settings);
    if (timer.currentTaskId && !tasks.some((t) => t.id === timer.currentTaskId))
      timer = { ...timer, currentTaskId: null };
    return { settings, tasks, sessions, timer };
  } catch {
    return fallback;
  }
}
export function load(): Data {
  try {
    return decode(localStorage.getItem(STORAGE_KEY));
  } catch {
    return decode(null);
  }
}
export function save(data: Data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, data }));
}
