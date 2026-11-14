import { test, expect } from "@playwright/test";

test("companion follows sessions, persists visibility, and the plant grows from real completions", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await expect(page.locator(".study-cat")).toHaveAttribute(
    "data-state",
    "sleeping",
  );
  await expect(page.locator(".growth-plant")).toHaveAttribute(
    "data-stage",
    "0",
  );
  await page.getByRole("button", { name: "Hide study companion" }).click();
  await page.reload();
  await expect(page.locator(".study-cat")).toHaveCount(0);
  await page.getByRole("button", { name: "Show study companion" }).click();
  await page.getByRole("button", { name: "Add task", exact: true }).click();
  await page.getByLabel("Task title").fill("A quiet chapter");
  await page.getByRole("button", { name: "Create task", exact: true }).click();
  await page.getByRole("button", { name: "Make this my focus" }).click();
  await page.getByRole("button", { name: "Start focus", exact: true }).click();
  await expect(page.locator(".study-cat")).toHaveAttribute(
    "data-state",
    "awake",
  );
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(page.locator(".focus-orb")).toHaveAttribute(
    "data-status",
    "PAUSED",
  );
  await expect(page.locator(".study-cat")).toHaveAttribute(
    "data-state",
    "sleeping",
  );
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await page.clock.fastForward(25 * 60000);
  await expect(page.locator(".study-cat")).toHaveAttribute(
    "data-state",
    "happy",
  );
  await expect(page.locator(".growth-plant")).toHaveAttribute(
    "data-stage",
    "1",
  );
  await expect(page.locator(".growth-plant")).toHaveAttribute(
    "aria-label",
    /1 completed focus sessions/,
  );
  await page.getByRole("button", { name: "Next: Short break" }).click();
  await expect(page.locator(".study-cat")).toHaveAttribute(
    "data-state",
    "resting",
  );
  await page.getByRole("button", { name: "Start break", exact: true }).click();
  await page.clock.fastForward(5 * 60000);
  await expect(page.locator(".growth-plant")).toHaveAttribute(
    "aria-label",
    /1 completed focus sessions/,
  );
  await page.reload();
  await expect(page.locator(".growth-plant")).toHaveAttribute(
    "data-stage",
    "1",
  );
});

test("reduced motion stops atmosphere and orb animations without stopping the timer", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Start focus", exact: true }).click();
  for (const selector of [".orb-halo", ".lavender-petals", ".tea-steam"]) {
    await expect(page.locator(selector)).toHaveCSS("animation-name", "none");
  }
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
});
