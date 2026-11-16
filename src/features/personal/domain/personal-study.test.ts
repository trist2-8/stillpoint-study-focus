import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { useApp } from "../../../stores/app-store";
import { defaults, type StudyTask, type StudySubject } from "../../../types";
import { idle } from "../../focus/domain/timer-engine";
import { decode } from "../../../services/storage";
import {
  exportBackup,
  importBackup,
  parsePortable,
} from "../../../services/backup";
import { emptyPersonal, nextStudyTask, weeklyReview } from "./personal-study";
const subject: StudySubject = {
  id: "math",
  name: "Toán",
  notes: "Ôn chương 2",
  scene: "library",
  createdAt: 1000,
};
const task: StudyTask = {
  id: "task",
  subjectId: "math",
  title: "Bài 1",
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
  vi.setSystemTime(new Date(2026, 10, 16, 9));
  localStorage.clear();
  useApp.setState({
    settings: { ...defaults, focusDuration: 1, shortBreakDuration: 1 },
    tasks: [],
    sessions: [],
    timer: idle("FOCUS", { ...defaults, focusDuration: 1 }),
    personal: { ...emptyPersonal },
    toast: "",
  });
});
afterEach(() => vi.useRealTimers());
describe("personal study data", () => {
  it("keeps a general session general when its task is moved during the session", () => {
    useApp.getState().putSubject(subject);
    useApp.getState().putTask({ ...task, subjectId: null });
    useApp.getState().selectTask(task.id);
    useApp.getState().timerAction("start");
    useApp.getState().putTask(task);
    vi.advanceTimersByTime(60000);
    useApp.getState().tick();
    expect(useApp.getState().sessions[0].subjectId).toBeNull();
  });
  it("migrates old data and round-trips new subjects, journal drafts and distractions", () => {
    const old = decode(
      JSON.stringify({
        version: 1,
        data: {
          settings: defaults,
          tasks: [{ ...task, subjectId: undefined }],
          sessions: [],
          timer: idle("FOCUS", defaults),
        },
      }),
    );
    expect(old.personal?.subjects).toEqual([]);
    expect(old.tasks[0].title).toBe("Bài 1");
    useApp.getState().putSubject(subject);
    useApp.getState().chooseSubject(subject.id);
    useApp.getState().putTask(task);
    useApp.getState().selectTask(task.id);
    useApp.getState().timerAction("start");
    vi.advanceTimersByTime(60000);
    useApp.getState().tick();
    const session = useApp.getState().sessions[0];
    useApp.getState().saveJournal({
      sessionId: session.id,
      accomplished: "Xong bài 1",
      blocked: "",
      nextStep: "Làm bài 2",
      energy: "steady",
      updatedAt: Date.now(),
      savedAt: null,
    });
    useApp.getState().addDistraction("Nhớ mua sách");
    const restored = importBackup(exportBackup(useApp.getState()));
    expect(restored.personal?.journals[0].nextStep).toBe("Làm bài 2");
    expect(restored.personal?.journals[0].savedAt).toBeNull();
    expect(restored.personal?.subjects[0].notes).toBe("Ôn chương 2");
    expect(restored.personal?.distractions[0].text).toBe("Nhớ mua sách");
    expect(restored.tasks[0].subjectId).toBe("math");
  });
  it("snapshots subject and goal so later task edits do not rewrite historical totals", () => {
    useApp.getState().putSubject(subject);
    useApp.getState().chooseSubject(subject.id);
    useApp.getState().chooseGoal("practice");
    useApp.getState().putTask(task);
    useApp.getState().selectTask(task.id);
    useApp.getState().timerAction("start");
    useApp.getState().chooseSubject(null);
    useApp.getState().chooseGoal("write");
    expect(useApp.getState().personal?.activeSubjectId).toBe("math");
    expect(useApp.getState().personal?.goal).toBe("practice");
    vi.advanceTimersByTime(60000);
    useApp.getState().tick();
    useApp.getState().tick();
    useApp.getState().putTask({ ...task, subjectId: null });
    expect(useApp.getState().sessions).toHaveLength(1);
    expect(useApp.getState().sessions[0]).toMatchObject({
      subjectId: "math",
      goal: "practice",
    });
    const state = useApp.getState();
    expect(
      weeklyReview(state.sessions, state.tasks, state.personal!).distribution[0]
        .id,
    ).toBe("math");
    vi.advanceTimersByTime(60000);
    useApp.getState().tick();
    const review = weeklyReview(
      useApp.getState().sessions,
      [],
      state.personal!,
    );
    expect(review.recent).toHaveLength(1);
    expect(review.minutes).toBe(1);
  });
  it("rejects duplicate subjects, malformed personal backup and journals for non-focus sessions", () => {
    useApp.getState().putSubject(subject);
    expect(() =>
      useApp.getState().putSubject({ ...subject, id: "math2", name: " toán " }),
    ).toThrow();
    expect(() =>
      parsePortable({
        settings: defaults,
        tasks: [],
        sessions: [],
        personal: { ...emptyPersonal, subjects: [{ ...subject, notes: 4 }] },
      }),
    ).toThrow();
    expect(() =>
      useApp.getState().saveJournal({
        sessionId: "missing",
        accomplished: "",
        blocked: "",
        nextStep: "",
        energy: "steady",
        updatedAt: 1000,
        savedAt: null,
      }),
    ).toThrow();
  });
  it("selects only unfinished tasks in the selected space", () => {
    expect(
      nextStudyTask(
        [task, { ...task, id: "other", subjectId: null }],
        "math",
        null,
      )?.id,
    ).toBe("task");
    expect(
      nextStudyTask([{ ...task, isCompleted: true }], "math", null),
    ).toBeUndefined();
  });
  it("weekly report excludes future/old sessions, breaks and unsaved journals", () => {
    const now = Date.now();
    const base = {
      id: "focus",
      taskId: "task",
      subjectId: "math",
      type: "FOCUS" as const,
      status: "COMPLETED" as const,
      startedAt: now - 60000,
      completedAt: now,
      plannedDurationMs: 60000,
      actualDurationMs: 60000,
      dateKey: "2026-11-16",
    };
    const report = weeklyReview(
      [
        base,
        { ...base, id: "break", type: "SHORT_BREAK" },
        { ...base, id: "old", completedAt: now - 8 * 86400000 },
        { ...base, id: "future", completedAt: now + 86400000 },
      ],
      [task],
      {
        ...emptyPersonal,
        subjects: [subject],
        journals: [
          {
            sessionId: "focus",
            accomplished: "note",
            blocked: "",
            nextStep: "",
            energy: "tired",
            savedAt: null,
            updatedAt: now,
          },
        ],
      },
    );
    expect(report.minutes).toBe(1);
    expect(report.journals).toHaveLength(0);
    expect(report.bestHour).toBeNull();
    expect(report.unfinished[0].id).toBe("task");
  });
});
