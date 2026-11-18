import { describe, it, expect } from "vitest";
import { displayTaskDate, parseTaskDate } from "./task-date";
describe("localized task date", () => {
  it("uses day first in Vietnamese and month first in English", () => {
    expect(parseTaskDate("25/11/2026", "vi")).toBe("2026-11-25");
    expect(parseTaskDate("11/25/2026", "en")).toBe("2026-11-25");
    expect(displayTaskDate("2026-11-25", "vi")).toBe("25/11/2026");
  });
  it("rejects rollover dates and accepts an empty deadline", () => {
    expect(parseTaskDate("31/02/2026", "vi")).toBeUndefined();
    expect(parseTaskDate("29/02/2028", "vi")).toBe("2028-02-29");
    expect(parseTaskDate("", "vi")).toBeNull();
  });
});
