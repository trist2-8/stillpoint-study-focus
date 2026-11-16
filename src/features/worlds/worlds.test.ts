import { beforeEach, describe, expect, it } from "vitest";
import { defaults } from "../../types";
import { useApp } from "../../stores/app-store";
import { decode } from "../../services/storage";
import { idle, start } from "../focus/domain/timer-engine";
import { emptyPersonal } from "../personal/domain/personal-study";
import { studyWorlds, worldTokens } from "../focus/worlds";
beforeEach(() =>
  useApp.getState().restore({
    settings: { ...defaults },
    timer: idle("FOCUS", defaults),
    tasks: [],
    sessions: [],
    personal: { ...emptyPersonal },
  }),
);
describe("presentation isolation", () => {
  it("preserves idle and running timer identity while saving appearance", () => {
    const initial = useApp.getState();
    useApp.getState().appearanceSave({ world: "academia", theme: "light" });
    expect(useApp.getState().timer).toBe(initial.timer);
    useApp.setState({ timer: start(initial.timer) });
    const running = useApp.getState();
    useApp.getState().appearanceSave({
      world: "forest",
      studyView: "desk",
      worldMotion: false,
    });
    const changed = useApp.getState();
    expect(changed.timer).toBe(running.timer);
    expect(changed.tasks).toBe(running.tasks);
    expect(changed.sessions).toBe(running.sessions);
    expect(changed.personal).toBe(running.personal);
  });
  it("does not switch worlds when choosing a goal or subject", () => {
    useApp.getState().appearanceSave({ world: "rainy-cafe" });
    useApp.getState().chooseGoal("practice");
    useApp.getState().chooseSubject(null);
    expect(useApp.getState().settings.world).toBe("rainy-cafe");
  });
  it("recovers unknown optional world values without losing a session or durations", () => {
    const timer = start(idle("FOCUS", defaults));
    const original = {
      ...useApp.getState(),
      timer,
      settings: {
        ...defaults,
        focusDuration: 55,
        world: "removed-world",
        palette: "midnight",
        favoriteWorlds: ["forest", "removed-world"],
      },
    };
    const restored = decode(JSON.stringify({ version: 1, data: original }));
    expect(restored.settings.world).toBe("midnight");
    expect(restored.settings.focusDuration).toBe(55);
    expect(restored.settings.favoriteWorlds).toEqual(["forest"]);
    expect(restored.timer).toEqual(timer);
  });
  it("provides distinct light and dark semantic tokens for all worlds", () => {
    expect(studyWorlds).toHaveLength(6);
    expect(
      new Set(
        studyWorlds.map(
          (world) => worldTokens(world.id, "dark")["--background"],
        ),
      ).size,
    ).toBe(6);
    for (const world of studyWorlds) {
      expect(Object.values(worldTokens(world.id, "light"))).not.toContain(
        undefined,
      );
      expect(worldTokens(world.id, "light")["--background"]).not.toBe(
        worldTokens(world.id, "dark")["--background"],
      );
    }
  });
});
