import { test, expect } from "@playwright/test";

test("reference dashboard supports tasks, timer, theme and responsive layouts", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1536, height: 1024 });
  await page.goto("/");
  await page.getByRole("button", { name: "Bàn học", exact: true }).click();
  await expect(page.getByRole("timer")).toHaveText("25:00");
  await page.getByRole("button", { name: "Thêm việc", exact: true }).click();
  await page.getByLabel("Tên việc học").fill("Math Chapter 5");
  await page.getByRole("button", { name: "Tạo việc học", exact: true }).click();
  await page
    .getByRole("button", { name: "Math Chapter 5", exact: true })
    .click();
  await expect(page.locator(".flow-current-task")).toContainText(
    "Math Chapter 5",
  );
  await page
    .getByRole("button", { name: "Bắt đầu tập trung", exact: true })
    .click();
  await expect(page.locator(".study-cat")).toHaveAttribute(
    "data-state",
    "awake",
  );
  await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  await page
    .getByRole("button", { name: "Đặt lại phiên", exact: true })
    .click();
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await page
    .getByRole("checkbox", { name: "Hoàn thành Math Chapter 5" })
    .check();
  await expect(page.locator(".flow-summary")).toContainText(
    "1 / 1 việc đã hoàn thành",
  );
  for (const width of [1536, 1280, 1024, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 1024 });
    await expect(page.getByRole("timer")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/reference-${width}.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 1536, height: 1024 });
  await page
    .getByRole("button", { name: "Đổi giao diện sáng tối", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(errors).toEqual([]);
});
