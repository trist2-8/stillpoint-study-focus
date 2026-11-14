import { test, expect } from "@playwright/test";
test("task lifecycle, validation, filters, and explicit task-to-focus start", async ({
  page,
}) => {
  await page.goto("/tasks");
  await page.getByRole("button", { name: "Add task", exact: true }).click();
  await page.getByRole("button", { name: "Create task", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Task title").fill("Study biology");
  await page.getByLabel("Estimated Pomodoros").fill("3");
  await page.getByRole("button", { name: "Create task", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Study biology" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit Study biology" }).click();
  await page.getByLabel("Task title").fill("Study chemistry");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.getByLabel("Search tasks").fill("biology");
  await expect(
    page.getByRole("heading", { name: "Study chemistry" }),
  ).toHaveCount(0);
  await page.getByLabel("Search tasks").fill("");
  await page
    .getByRole("checkbox", { name: "Complete Study chemistry" })
    .check();
  await page.getByLabel("Filter tasks").selectOption("active");
  await expect(
    page.getByRole("heading", { name: "Study chemistry" }),
  ).toHaveCount(0);
  await page.getByLabel("Filter tasks").selectOption("completed");
  await page.getByRole("checkbox", { name: "Reopen Study chemistry" }).click();
  await page.getByLabel("Filter tasks").selectOption("all");
  await page.getByRole("button", { name: "Start focus", exact: true }).click();
  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("button", { name: "Start focus", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByText("Study chemistry").first()).toBeVisible();
  await page.getByRole("button", { name: "Start focus", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await page.getByRole("button", { name: "Reset timer" }).click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(page.getByRole("timer")).toHaveText("25:00");
  await page.goto("/tasks");
  await page.getByRole("button", { name: "Delete Study chemistry" }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Study chemistry" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Delete Study chemistry" }).click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Study chemistry" }),
  ).toHaveCount(0);
});
test("settings, theme persistence, modes, skip, sidebar and keyboard dialogs", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Toggle theme" }).click();
  const theme = await page.locator("html").getAttribute("data-theme");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme!);
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await page.getByRole("button", { name: "Open settings" }).click();
  await page.getByLabel("Focus (minutes)", { exact: true }).fill("1");
  await page.getByLabel("Theme", { exact: true }).selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(page.getByRole("timer")).toHaveText("01:00");
  await page.getByRole("button", { name: "Short break", exact: true }).click();
  await expect(page.getByRole("timer")).toHaveText("05:00");
  await page.getByRole("button", { name: "Long break", exact: true }).click();
  await expect(page.getByRole("timer")).toHaveText("15:00");
  await page.getByRole("button", { name: "Skip session" }).click();
  await expect(page.getByRole("timer")).toHaveText("01:00");
  await page.getByRole("button", { name: "Open settings" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Open settings" }),
  ).toBeFocused();
});
test("deadline restoration, background recalculation and analytics match persisted history", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("button", { name: "Start focus", exact: true }).click();
  await page.clock.fastForward(61000);
  await expect(page.getByRole("timer")).toHaveText("23:59");
  await page.reload();
  await expect(page.getByRole("timer")).toHaveText("23:59");
  await page.clock.fastForward(24 * 60000);
  await page.evaluate(() =>
    document.dispatchEvent(new Event("visibilitychange")),
  );
  await expect(
    page.getByRole("button", { name: "Next: Short break" }),
  ).toBeVisible();
  await page.reload();
  const history = await page.evaluate(
    () => JSON.parse(localStorage.getItem("focus-flow")!).data.sessions,
  );
  expect(history).toHaveLength(1);
  expect(history[0].actualDurationMs).toBe(1500000);
  await page.goto("/insights");
  await expect(page.getByText("25m", { exact: true })).toHaveCount(2);
  await page.getByText("View daily totals & how they’re calculated").click();
  await expect(page.locator("tbody")).toContainText("25");
  await page.getByLabel("Analytics date range").selectOption("90");
  await expect(page.locator("tbody tr")).toHaveCount(90);
});
for (const width of [360, 375, 390, 430, 768, 1024, 1280, 1440, 1920])
  test(`responsive pages and themes at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const theme of ["light", "dark"]) {
      for (const path of ["/", "/tasks", "/insights"]) {
        await page.goto(path);
        await page.evaluate((theme) => {
          document.documentElement.dataset.theme = theme;
        }, theme);
        await expect(page.locator("h1")).toBeVisible();
        await expect
          .poll(() =>
            page.evaluate(
              () => document.documentElement.scrollWidth <= window.innerWidth,
            ),
          )
          .toBe(true);
        if (path === "/") {
          const box = await page.locator(".timer-circle").boundingBox();
          expect(Math.abs(box!.width - box!.height)).toBeLessThan(1);
          await page.screenshot({
            path: `test-results/focus-${width}-${theme}.png`,
            fullPage: true,
          });
        }
        await page.getByRole("button", { name: "Open settings" }).click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await expect
          .poll(() =>
            page
              .getByRole("dialog")
              .evaluate((el) => el.scrollWidth <= el.clientWidth),
          )
          .toBe(true);
        await page.getByRole("button", { name: "Close dialog" }).click();
      }
    }
    expect(errors).toEqual([]);
  });
