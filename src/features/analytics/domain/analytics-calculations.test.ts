import { describe, it, expect } from "vitest";
import { aggregate, dateKey, streak } from "./analytics-calculations";
import type { FocusSession } from "../../../types";
const now = new Date(2026, 10, 14, 12);
const session = (
  day: number,
  type: FocusSession["type"] = "FOCUS",
): FocusSession => ({
  id: String(day) + type,
  taskId: null,
  type,
  status: "COMPLETED",
  startedAt: new Date(2026, 10, day, 10).getTime(),
  completedAt: new Date(2026, 10, day, 10, 25).getTime(),
  plannedDurationMs: 1500000,
  actualDurationMs: 1500000,
  dateKey: dateKey(new Date(2026, 10, day)),
});
describe("session analytics", () => {
  it("fills empty days and includes exactly seven local dates", () => {
    const result = aggregate([], 7, now);
    expect(result).toHaveLength(7);
    expect(result[0].date).toBe("2026-11-08");
    expect(result.every((d) => d.minutes === 0)).toBe(true);
  });
  it("sums completed focus time and excludes breaks and skipped records", () => {
    const result = aggregate(
      [
        session(14),
        session(14, "SHORT_BREAK"),
        { ...session(13), status: "SKIPPED" } as unknown as FocusSession,
      ],
      7,
      now,
    );
    expect(result.reduce((sum, d) => sum + d.minutes, 0)).toBe(25);
    expect(result[6].sessions).toBe(1);
  });
  it("supports 30/90 day ranges across month boundaries", () => {
    expect(aggregate([session(1)], 30, now)[0].date).toBe("2026-10-16");
    expect(aggregate([], 90, now)).toHaveLength(90);
  });
  it("counts streaks ending today or yesterday and stops at gaps", () => {
    expect(streak([session(14), session(13), session(12)], now)).toBe(3);
    expect(streak([session(13), session(12)], now)).toBe(2);
    expect(streak([session(12)], now)).toBe(0);
    expect(streak([], now)).toBe(0);
  });
  it("keeps saved completion dates stable and assigns midnight correctly", () => {
    expect(dateKey(new Date(2026, 10, 15, 0, 0))).toBe("2026-11-15");
    const s = { ...session(14), dateKey: "2026-11-13" };
    expect(aggregate([s], 7, now)[5].minutes).toBe(25);
    expect(aggregate([s], 7, now)[6].minutes).toBe(0);
  });
});
