import { test, expect } from "@playwright/test";

test("Vietnamese task lifecycle and explicit focus controls", async ({
  page,
}) => {
  await page.goto("/tasks");
  await page.getByRole("button", { name: "Thêm việc", exact: true }).click();
  await page.getByLabel("Tên việc học").fill("Ôn sinh học");
  await page.getByLabel("Số phiên dự kiến").fill("3");
  await page.getByRole("button", { name: "Tạo việc học", exact: true }).click();
  await page.getByRole("button", { name: "Sửa Ôn sinh học" }).click();
  await page.getByLabel("Tên việc học").fill("Ôn hóa học");
  await page.getByRole("button", { name: "Lưu thay đổi" }).click();
  await page.getByLabel("Tìm việc học").fill("sinh");
  await expect(page.getByRole("heading", { name: "Ôn hóa học" })).toHaveCount(
    0,
  );
  await page.getByLabel("Tìm việc học").fill("");
  await page.getByRole("checkbox", { name: "Hoàn thành Ôn hóa học" }).check();
  await page.getByLabel("Lọc việc học").selectOption("active");
  await expect(page.getByRole("heading", { name: "Ôn hóa học" })).toHaveCount(
    0,
  );
  await page.getByLabel("Lọc việc học").selectOption("completed");
  await page.getByRole("checkbox", { name: "Mở lại Ôn hóa học" }).click();
  await page.getByLabel("Lọc việc học").selectOption("all");
  await page
    .getByRole("button", { name: "Bắt đầu tập trung", exact: true })
    .click();
  await expect(page).toHaveURL("/");
  await page
    .getByRole("button", { name: "Bắt đầu tập trung", exact: true })
    .click();
  await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.getByRole("button", { name: "Đặt lại phiên" }).click();
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await expect(page.getByRole("timer")).toHaveText("25:00");
  await page.goto("/tasks");
  await page.getByRole("button", { name: "Xóa Ôn hóa học" }).click();
  await page.getByRole("button", { name: "Hủy", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Ôn hóa học" })).toBeVisible();
  await page.getByRole("button", { name: "Xóa Ôn hóa học" }).click();
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Ôn hóa học" })).toHaveCount(
    0,
  );
});

test("mobile settings persist palette, theme and durations", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Mở cài đặt", exact: true }).click();
  await page.getByLabel("Tập trung (phút)", { exact: true }).fill("1");
  await page
    .getByLabel("Chế độ sáng tối", { exact: true })
    .selectOption("light");
  await page.getByLabel("Bảng màu", { exact: true }).selectOption("forest");
  await page.getByRole("button", { name: "Lưu cài đặt" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-palette", "forest");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("timer")).toHaveText("01:00");
  await page.getByLabel("Chế độ phiên").selectOption("SHORT_BREAK");
  await expect(page.getByRole("timer")).toHaveText("05:00");
  await page.getByLabel("Chế độ phiên").selectOption("LONG_BREAK");
  await expect(page.getByRole("timer")).toHaveText("15:00");
  await page.getByRole("button", { name: "Bỏ qua phiên" }).click();
  await expect(page.getByRole("timer")).toHaveText("01:00");
  await page.getByRole("button", { name: "Mở cài đặt", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Mở cài đặt", exact: true }),
  ).toBeFocused();
});

test("deadline restoration and both calendars reflect only completed focus sessions", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await expect(
    page.locator('.activity-grid button[data-level="0"]'),
  ).toHaveCount(30);
  await page
    .getByRole("button", { name: "Bắt đầu tập trung", exact: true })
    .click();
  await page.clock.fastForward(61000);
  await expect(page.getByRole("timer")).toHaveText("23:59");
  await page.reload();
  await expect(page.getByRole("timer")).toHaveText("23:59");
  await page.clock.fastForward(24 * 60000);
  await page.evaluate(() =>
    document.dispatchEvent(new Event("visibilitychange")),
  );
  await expect(
    page.getByRole("button", { name: "Tiếp theo: Nghỉ ngắn" }),
  ).toBeVisible();
  await expect(
    page.locator('.activity-grid button[data-level="1"]'),
  ).toHaveCount(1);
  await page.locator('.activity-grid button[data-level="1"]').click();
  await expect(page.locator(".activity-detail")).toContainText(
    "1 phiên hoàn tất, 25 phút",
  );
  await page.reload();
  const history = await page.evaluate(
    () => JSON.parse(localStorage.getItem("focus-flow")!).data.sessions,
  );
  expect(history).toHaveLength(1);
  expect(history[0].actualDurationMs).toBe(1500000);
  await page.goto("/insights");
  await expect(page.getByText("25 phút", { exact: true })).toHaveCount(2);
  await page.getByLabel("Khoảng thời gian tiến độ").selectOption("90");
  await expect(page.locator(".activity-grid button")).toHaveCount(90);
  await page.locator('.activity-grid button[data-level="1"]').focus();
  await expect(page.locator(".activity-detail")).toContainText(
    "1 phiên hoàn tất, 25 phút",
  );
  await page.getByText("Xem tổng từng ngày và cách tính").click();
  await expect(page.locator("tbody tr")).toHaveCount(90);
});

for (const width of [320, 360, 390, 430, 768, 1024, 1280, 1440, 1920]) {
  test(
    "responsive routes and readable palettes at " + width + "px",
    async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      for (const theme of ["light", "dark"]) {
        for (const palette of ["lavender", "midnight", "forest"]) {
          for (const path of ["/", "/tasks", "/insights"]) {
            await page.goto(path);
            await page.evaluate(
              ({ theme, palette }) => {
                document.documentElement.dataset.theme = theme;
                document.documentElement.dataset.palette = palette;
              },
              { theme, palette },
            );
            await expect(page.locator("h1")).toBeAttached();
            expect(
              await page.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth,
              ),
            ).toBe(true);
            if (path === "/") {
              const orb = await page.locator(".flow-orb").boundingBox();
              expect(Math.abs(orb!.width - orb!.height)).toBeLessThan(1);
              const controls = await page
                .locator(".flow-controls")
                .boundingBox();
              const card = await page.locator(".flow-room-wrap").boundingBox();
              expect(controls!.y + controls!.height).toBeLessThanOrEqual(
                card!.y + card!.height,
              );
              const contrast = await page
                .locator(".activity-description")
                .evaluate((element) => {
                  const luminance = (color: string) => {
                    const rgb = color
                      .match(/[\d.]+/g)!
                      .slice(0, 3)
                      .map(Number)
                      .map((value) => {
                        const channel = value / 255;
                        return channel <= 0.04045
                          ? channel / 12.92
                          : ((channel + 0.055) / 1.055) ** 2.4;
                      });
                    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
                  };
                  const text = luminance(getComputedStyle(element).color);
                  const background = luminance(
                    getComputedStyle(element.closest(".flow-card")!)
                      .backgroundColor,
                  );
                  return (
                    (Math.max(text, background) + 0.05) /
                    (Math.min(text, background) + 0.05)
                  );
                });
              expect(contrast).toBeGreaterThanOrEqual(4.5);
            }
          }
        }
      }
      await page
        .getByRole("button", { name: "Mở cài đặt", exact: true })
        .click();
      await expect(page.getByRole("dialog")).toBeVisible();
      expect(
        await page
          .getByRole("dialog")
          .evaluate((element) => element.scrollWidth <= element.clientWidth),
      ).toBe(true);
      expect(errors).toEqual([]);
    },
  );
}
