import { describe, it, expect } from "vitest";
import { defaults } from "../../../types";
import {
  idle,
  start,
  pause,
  remaining,
  complete,
  nextMode,
} from "./timer-engine";
import { decode } from "../../../services/storage";
describe("timestamp timer", () => {
  it("starts idle and validates duration", () => {
    expect(idle("FOCUS", defaults).remainingMs).toBe(1500000);
    expect(() => idle("FOCUS", { ...defaults, focusDuration: -1 })).toThrow();
  });
  it("starts, pauses, and resumes without counting paused time", () => {
    let now = 1000;
    const c = { now: () => now };
    let t = start(idle("FOCUS", defaults), c);
    now += 20000;
    t = pause(t, c);
    expect(t.remainingMs).toBe(1480000);
    now += 80000;
    t = start(t, c);
    expect(t.deadlineAt).toBe(now + 1480000);
    expect(t.startedAt).toBe(1000);
  });
  it("recalculates after a background gap and completes exactly once", () => {
    let now = 0;
    const c = { now: () => now };
    const t = start(idle("FOCUS", defaults), c);
    now = 1600000;
    expect(remaining(t, c)).toBe(0);
    const done = complete(t, c);
    expect(done.status).toBe("COMPLETED");
    expect(complete(done, c)).toBe(done);
  });
  it("restores a running deadline from versioned storage", () => {
    const t = start(idle("FOCUS", defaults), { now: () => 1000 });
    const restored = decode(
      JSON.stringify({
        version: 1,
        data: { settings: defaults, timer: t, tasks: [], sessions: [] },
      }),
    );
    expect(remaining(restored.timer, { now: () => 61000 })).toBe(1440000);
  });
  it("resets without completion and uses completed focuses for the cycle", () => {
    expect(idle("FOCUS", defaults).status).toBe("IDLE");
    expect(nextMode("FOCUS", 0, 4)).toBe("SHORT_BREAK");
    expect(nextMode("FOCUS", 3, 4)).toBe("SHORT_BREAK");
    expect(nextMode("FOCUS", 4, 4)).toBe("LONG_BREAK");
    expect(nextMode("LONG_BREAK", 4, 4)).toBe("FOCUS");
  });
  it("bounds a backward clock change", () => {
    const t = start(idle("FOCUS", defaults), { now: () => 100000 });
    expect(remaining(t, { now: () => 0 })).toBe(t.durationMs);
  });
  it("recovers corrupted and unsupported storage", () => {
    expect(decode("{").tasks).toEqual([]);
    expect(decode('{"version":999}').timer.status).toBe("IDLE");
  });
});
