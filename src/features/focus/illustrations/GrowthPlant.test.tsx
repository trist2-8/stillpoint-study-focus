import { expect, it } from "vitest";
import { growthStage } from "./GrowthPlant";
import { decode } from "../../../services/storage";
import { defaults } from "../../../types";

it("uses actual completion thresholds and keeps a seed at zero", () => {
  expect([0, 1, 3, 4, 11, 12, 29, 30, 1000].map(growthStage)).toEqual([
    0, 1, 1, 2, 2, 3, 3, 4, 4,
  ]);
});
it("keeps existing settings when the older schema has no companion preference", () => {
  const old = { ...defaults, focusDuration: 40 };
  delete old.companionEnabled;
  const data = decode(
    JSON.stringify({
      version: 1,
      data: { settings: old, tasks: [], sessions: [] },
    }),
  );
  expect(data.settings.focusDuration).toBe(40);
  expect(data.settings.companionEnabled !== false).toBe(true);
});
