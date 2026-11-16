import { test, expect } from "@playwright/test";

test("companion visibility persists and plant grows only after focus completion", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("button", { name: "Bàn học", exact: true }).click();
  await expect(page.locator(".study-cat")).toHaveAttribute(
    "data-state",
    "sleeping",
  );
  await page.goto("/insights");
  await expect(page.locator(".growth-plant")).toHaveAttribute(
    "data-stage",
    "0",
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Bàn học", exact: true }).click();
  await page.getByRole("button", { name: "Mở cài đặt", exact: true }).click();
  await page.getByLabel("Hiện mèo đồng hành").uncheck();
  await page.getByRole("button", { name: "Lưu cài đặt" }).click();
  await page.reload();
  await expect(page.locator(".study-cat")).toHaveCount(0);
  await page.getByRole("button", { name: "Mở cài đặt", exact: true }).click();
  await page.getByLabel("Hiện mèo đồng hành").check();
  await page.getByRole("button", { name: "Lưu cài đặt" }).click();
  await page
    .getByRole("button", { name: "Bắt đầu tập trung", exact: true })
    .click();
  await expect(page.locator(".study-cat")).toHaveAttribute(
    "data-state",
    "awake",
  );
  await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  await expect(page.locator(".study-cat")).toHaveAttribute(
    "data-state",
    "sleeping",
  );
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.clock.fastForward(25 * 60000);
  await expect(page.locator(".today-progress")).toContainText("1 / 6");
  await expect(page.locator(".journal-form")).toBeVisible();
  await expect(page.getByLabel("Chế độ phiên")).toHaveValue("SHORT_BREAK");
  await expect(page.locator(".study-cat")).toHaveAttribute(
    "data-state",
    "resting",
  );
  await expect(
    page.getByRole("button", { name: "Tạm dừng", exact: true }),
  ).toBeVisible();
  await page.clock.fastForward(5 * 60000);
  await page.goto("/insights");
  await expect(page.locator(".growth-plant")).toHaveAttribute(
    "data-stage",
    "1",
  );
  await page.goto("/insights");
  await expect(page.locator(".growth-plant")).toHaveAttribute(
    "data-stage",
    "1",
  );
});

test("reduced motion stops ambient animations while timer runs", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Bàn học", exact: true }).click();
  await page
    .getByRole("button", { name: "Bắt đầu tập trung", exact: true })
    .click();
  await expect(page.locator(".orb-halo")).toHaveCSS("animation-name", "none");
  await expect(
    page.getByRole("button", { name: "Tạm dừng", exact: true }),
  ).toBeVisible();
});
