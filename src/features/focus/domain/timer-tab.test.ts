import { describe, expect, it } from "vitest";
import { defaults } from "../../../types";
import { idle, pause, start } from "./timer-engine";
import { timerTabTitle } from "./timer-tab";

describe("browser tab timer", () => {
  it("shows the countdown first and stays frozen when paused", () => {
    const running = start(idle("FOCUS", defaults), { now: () => 0 });
    expect(timerTabTitle(running, 61000)).toBe(
      "23:59 · Tập trung | Focus Flow",
    );
    const paused = pause(running, { now: () => 61000 });
    expect(timerTabTitle(paused, 500000)).toBe("23:59 · Tạm dừng | Focus Flow");
  });
  it("labels the break and ready states in Vietnamese", () => {
    expect(timerTabTitle(idle("FOCUS", defaults), 0)).toBe(
      "Focus Flow · Phòng học của bạn",
    );
    expect(
      timerTabTitle(
        start(idle("LONG_BREAK", defaults), { now: () => 0 }),
        1000,
      ),
    ).toBe("14:59 · Nghỉ dài | Focus Flow");
  });
});
