import type { Mode, TimerState, UserSettings } from "../../../types";
export interface Clock {
  now(): number;
}
export const clock: Clock = { now: () => Date.now() };
export const duration = (mode: Mode, s: UserSettings) =>
  60000 *
  (mode === "FOCUS"
    ? s.focusDuration
    : mode === "SHORT_BREAK"
      ? s.shortBreakDuration
      : s.longBreakDuration);
export function idle(
  mode: Mode,
  s: UserSettings,
  taskId: string | null = null,
): TimerState {
  const ms = duration(mode, s);
  if (!Number.isFinite(ms) || ms < 60000 || ms > 180 * 60000)
    throw new Error("Duration must be between 1 and 180 minutes");
  return {
    mode,
    status: "IDLE",
    durationMs: ms,
    remainingMs: ms,
    deadlineAt: null,
    startedAt: null,
    pausedAt: null,
    currentTaskId: taskId,
    sessionId: crypto.randomUUID(),
  };
}
export function remaining(t: TimerState, c: Clock = clock) {
  return t.status === "RUNNING"
    ? Math.max(0, Math.min(t.durationMs, (t.deadlineAt ?? c.now()) - c.now()))
    : t.remainingMs;
}
export function start(t: TimerState, c: Clock = clock): TimerState {
  if (t.status !== "IDLE" && t.status !== "PAUSED") return t;
  const now = c.now();
  return {
    ...t,
    status: "RUNNING",
    startedAt: t.startedAt ?? now,
    pausedAt: null,
    deadlineAt: now + t.remainingMs,
  };
}
export function pause(t: TimerState, c: Clock = clock): TimerState {
  if (t.status !== "RUNNING") return t;
  return {
    ...t,
    status: "PAUSED",
    remainingMs: remaining(t, c),
    deadlineAt: null,
    pausedAt: c.now(),
  };
}
export function complete(t: TimerState, c: Clock = clock): TimerState {
  return t.status === "RUNNING" && remaining(t, c) === 0
    ? { ...t, status: "COMPLETED", remainingMs: 0 }
    : t;
}
export function nextMode(
  mode: Mode,
  completed: number,
  interval: number,
): Mode {
  return mode === "FOCUS"
    ? completed > 0 && completed % interval === 0
      ? "LONG_BREAK"
      : "SHORT_BREAK"
    : "FOCUS";
}
