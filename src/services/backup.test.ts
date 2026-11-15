import { describe, it, expect } from "vitest";
import { defaults } from "../types";
import { idle, start } from "../features/focus/domain/timer-engine";
import { exportBackup, importBackup, parsePortable, fromCloud } from "./backup";
const sample = () => ({
  settings: { ...defaults },
  tasks: [],
  sessions: [],
  timer: idle("FOCUS", defaults),
});
describe("backup safety", () => {
  it("exports data only, excluding UI notifications", () => {
    const exported = JSON.parse(
      exportBackup({ ...sample(), toast: "private UI message" } as ReturnType<
        typeof sample
      >),
    );
    expect(exported.data.toast).toBeUndefined();
    expect(Object.keys(exported.data).sort()).toEqual([
      "sessions",
      "settings",
      "tasks",
      "timer",
    ]);
  });
  it("round-trips settings and pauses a running timer", () => {
    const data = sample();
    data.timer = start(data.timer);
    const backup = importBackup(exportBackup(data));
    expect(backup.settings).toEqual(defaults);
    expect(backup.timer.status).toBe("PAUSED");
    expect(backup.timer.deadlineAt).toBeNull();
  });
  it("rejects corrupt, wrong-version and partially invalid data without falling back to empty", () => {
    for (const raw of [
      "{",
      JSON.stringify({ version: 99 }),
      JSON.stringify({
        application: "focus-flow",
        version: 1,
        data: { ...sample(), tasks: [{ title: "bad" }] },
      }),
    ])
      expect(() => importBackup(raw)).toThrow();
  });
  it("migrates older settings without losing preferences", () => {
    const { language, scene, ...legacy } = defaults;
    expect(language).toBe("vi");
    expect(scene).toBe("study");
    const portable = parsePortable({
      settings: { ...legacy, theme: "light" },
      tasks: [],
      sessions: [],
    });
    expect(portable.settings.language).toBe("vi");
    expect(portable.settings.theme).toBe("light");
  });
  it("cloud restoration keeps the active local timer", () => {
    const current = sample();
    current.timer = start(current.timer);
    const restored = fromCloud(
      { ...sample(), settings: { ...defaults, focusDuration: 50 } },
      current,
    );
    expect(restored.timer.deadlineAt).toBe(current.timer.deadlineAt);
    expect(restored.settings.focusDuration).toBe(50);
  });
});
