import { describe, it, expect } from "vitest";
import { normalizeMix } from "./sound-store";
describe("saved sound preferences", () => {
  it("rejects invalid tracks and clamps volumes without autoplay state", () => {
    expect(
      normalizeMix({
        master: 200,
        selected: ["birds", "birds", "unknown"],
        levels: { birds: -4, stream: 300, wind: NaN, unknown: 30 },
        paused: false,
      }),
    ).toEqual({
      master: 100,
      selected: ["birds"],
      levels: { birds: 0, stream: 100 },
    });
  });
  it("recovers from missing or malformed preferences", () => {
    expect(normalizeMix(null)).toEqual({
      master: 45,
      levels: {},
      selected: [],
    });
    expect(normalizeMix({ master: Infinity, selected: "birds" })).toEqual({
      master: 45,
      levels: {},
      selected: [],
    });
  });
});
