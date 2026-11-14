import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { useApp } from "./app-store";
import { defaults, type StudyTask } from "../types";
import { idle } from "../features/focus/domain/timer-engine";
const task: StudyTask = {
  id: "task-1",
  title: "Read chapter one",
  description: "",
  priority: "high",
  estimatedPomodoros: 2,
  completedPomodoros: 0,
  isCompleted: false,
  createdAt: 1000,
  updatedAt: 1000,
  dueAt: null,
};
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 10, 14, 10));
  localStorage.clear();
  useApp.setState({
    settings: { ...defaults },
    tasks: [],
    sessions: [],
    timer: idle("FOCUS", defaults),
    toast: "",
  });
});
afterEach(() => vi.useRealTimers());
describe("integrated timer and tasks", () => {
  it("creates, edits, completes, reopens and deletes a task", () => {
    useApp.getState().putTask(task);
    useApp.getState().putTask({ ...task, title: "Updated", isCompleted: true });
    expect(useApp.getState().tasks[0].isCompleted).toBe(true);
    useApp
      .getState()
      .putTask({ ...useApp.getState().tasks[0], isCompleted: false });
    expect(useApp.getState().tasks[0].title).toBe("Updated");
    useApp.getState().deleteTask(task.id);
    expect(useApp.getState().tasks).toEqual([]);
  });
  it("selects a task without starting and credits completion exactly once", () => {
    useApp.getState().putTask(task);
    useApp.getState().selectTask(task.id);
    expect(useApp.getState().timer.status).toBe("IDLE");
    useApp.getState().timerAction("start");
    vi.advanceTimersByTime(1500000);
    useApp.getState().tick();
    useApp.getState().tick();
    expect(useApp.getState().sessions).toHaveLength(1);
    expect(useApp.getState().tasks[0].completedPomodoros).toBe(1);
    expect(useApp.getState().tasks[0].isCompleted).toBe(false);
    expect(useApp.getState().timer.status).toBe("COMPLETED");
  });
  it("reset and skip never credit an incomplete session", () => {
    useApp.getState().timerAction("start");
    vi.advanceTimersByTime(60000);
    useApp.getState().timerAction("reset");
    expect(useApp.getState().sessions).toHaveLength(0);
    useApp.getState().timerAction("start");
    useApp.getState().timerAction("skip");
    expect(useApp.getState().sessions).toHaveLength(0);
    expect(useApp.getState().timer.mode).toBe("SHORT_BREAK");
  });
  it("finishes the fourth focus with a long break and never credits breaks to a task", () => {
    useApp.getState().putTask(task);
    useApp.getState().selectTask(task.id);
    for (let i = 0; i < 4; i++) {
      useApp.getState().setMode("FOCUS");
      useApp.getState().timerAction("start");
      vi.advanceTimersByTime(1500000);
      useApp.getState().tick();
    }
    useApp.getState().timerAction("next");
    expect(useApp.getState().timer.mode).toBe("LONG_BREAK");
    useApp.getState().timerAction("start");
    vi.advanceTimersByTime(900000);
    useApp.getState().tick();
    expect(useApp.getState().tasks[0].completedPomodoros).toBe(4);
    expect(useApp.getState().sessions).toHaveLength(5);
  });
  it("autostarts only when enabled", () => {
    useApp.getState().settingsSave({ ...defaults, autoStartBreaks: true });
    useApp.getState().timerAction("start");
    vi.advanceTimersByTime(1500000);
    useApp.getState().tick();
    expect(useApp.getState().timer.status).toBe("RUNNING");
    expect(useApp.getState().timer.mode).toBe("SHORT_BREAK");
  });
  it("pauses safely on a backward clock change and rejects invalid tasks", () => {
    useApp.getState().timerAction("start");
    vi.setSystemTime(new Date(2026, 10, 13));
    useApp.getState().tick();
    expect(useApp.getState().timer.status).toBe("PAUSED");
    expect(() =>
      useApp.getState().putTask({ ...task, estimatedPomodoros: -1 }),
    ).toThrow();
  });
});
