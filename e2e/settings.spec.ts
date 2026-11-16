import { test, expect } from "@playwright/test";

test("settings previews cancel cleanly and saved values survive reload", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Mở cài đặt", exact: true }).click();
  await page.getByRole("radio", { name: "Sáng", exact: true }).check();
  await page.getByRole("radio", { name: /Rừng yên tĩnh/ }).check();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).toHaveAttribute("data-palette", "forest");
  await page.getByRole("button", { name: "Học sâu", exact: false }).click();
  await page.getByRole("button", { name: "Hủy", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute(
    "data-palette",
    "lavender",
  );
  await expect(page.getByRole("timer")).toHaveText("25:00");
  await page.reload();
  await page.getByRole("button", { name: "Mở cài đặt", exact: true }).click();
  await page.getByRole("radio", { name: /Đêm xanh/ }).check();
  await page.keyboard.press("Escape");
  await expect(page.locator("html")).toHaveAttribute(
    "data-palette",
    "lavender",
  );
  await page.getByRole("button", { name: "Mở cài đặt", exact: true }).click();
  await page.getByRole("button", { name: "Học sâu", exact: false }).click();
  await page.getByRole("radio", { name: /Đêm xanh/ }).check();
  await page.getByRole("button", { name: "Lưu cài đặt", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("timer")).toHaveText("50:00");
  await expect(page.locator("html")).toHaveAttribute(
    "data-palette",
    "midnight",
  );
});

test("automatic cycle runs outside the focus page and updates the browser tab", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("button", { name: "Mở cài đặt", exact: true }).click();
  await page.getByLabel("Tập trung (phút)", { exact: true }).fill("1");
  await page.getByLabel("Nghỉ ngắn (phút)", { exact: true }).fill("1");
  await page.getByLabel("Nghỉ dài (phút)", { exact: true }).fill("2");
  await page.getByLabel("Nghỉ dài sau số phiên", { exact: true }).fill("2");
  await page.getByLabel("Tự động lặp chu kỳ", { exact: true }).check();
  await page.getByRole("button", { name: "Lưu cài đặt", exact: true }).click();
  await page
    .getByRole("button", { name: "Bắt đầu tập trung", exact: true })
    .click();
  await expect(page).toHaveTitle("01:00 · Tập trung | Focus Flow");
  await page
    .getByRole("navigation", { name: "Điều hướng chính" })
    .getByRole("link", { name: "Việc học", exact: true })
    .click();
  await page.clock.fastForward(15000);
  await expect(page).toHaveTitle("00:45 · Tập trung | Focus Flow");
  await page.clock.fastForward(45000);
  await expect(page).toHaveTitle("01:00 · Nghỉ ngắn | Focus Flow");
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    "href",
    "/favicon-break.svg",
  );
  await page.clock.fastForward(60000);
  await expect(page).toHaveTitle("01:00 · Tập trung | Focus Flow");
  await page.clock.fastForward(60000);
  await expect(page).toHaveTitle("02:00 · Nghỉ dài | Focus Flow");
  const restDeadline = await page.evaluate(
    () => JSON.parse(localStorage.getItem("focus-flow")!).data.timer.deadlineAt,
  );
  await page.reload();
  await expect(page).toHaveTitle(/Nghỉ dài/);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("focus-flow")!).data.timer.deadlineAt,
    ),
  ).toBe(restDeadline);
  await page.clock.fastForward(120000);
  await expect(page).toHaveTitle(/Tập trung/);
  await page
    .getByRole("navigation", { name: "Điều hướng chính" })
    .getByRole("link", { name: "Hôm nay", exact: true })
    .click();
  await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  await expect(page).toHaveTitle(/Tạm dừng/);
  const pausedTitle = await page.title();
  await page.clock.fastForward(120000);
  await expect(page).toHaveTitle(pausedTitle);
  const sessions = await page.evaluate(
    () => JSON.parse(localStorage.getItem("focus-flow")!).data.sessions,
  );
  expect(sessions.map((session: { type: string }) => session.type)).toEqual([
    "FOCUS",
    "SHORT_BREAK",
    "FOCUS",
    "LONG_BREAK",
  ]);
});

test("denied notifications leave the draft open without partially saving", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "Notification", {
      configurable: true,
      value: { permission: "denied", requestPermission: async () => "denied" },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Mở cài đặt", exact: true }).click();
  await page.getByLabel("Thông báo trình duyệt", { exact: true }).check();
  await page.getByLabel("Tập trung (phút)", { exact: true }).fill("50");
  await page.getByRole("button", { name: "Lưu cài đặt", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Chưa được cấp quyền");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Hủy", exact: true }).click();
  await expect(page.getByRole("timer")).toHaveText("25:00");
});

for (const width of [320, 390, 768, 1440]) {
  test(
    "settings controls stay inside the dialog at " + width + "px",
    async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      await page
        .getByRole("button", { name: "Mở cài đặt", exact: true })
        .click();
      for (const theme of ["Sáng", "Tối"]) {
        await page.getByRole("radio", { name: theme, exact: true }).check();
        const geometry = await page.getByRole("dialog").evaluate((element) => {
          const rect = element.getBoundingClientRect();
          const footer = element
            .querySelector(".settings-footer")!
            .getBoundingClientRect();
          const body = element.querySelector(".settings-scroll")!;
          return {
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
            width: innerWidth,
            height: innerHeight,
            scrollOverflow: body.scrollWidth - body.clientWidth,
            footerTop: footer.top,
            footerBottom: footer.bottom,
          };
        });
        expect(geometry.left).toBeGreaterThanOrEqual(0);
        expect(geometry.top).toBeGreaterThanOrEqual(0);
        expect(geometry.right).toBeLessThanOrEqual(geometry.width);
        expect(geometry.bottom).toBeLessThanOrEqual(geometry.height);
        expect(geometry.scrollOverflow).toBeLessThanOrEqual(1);
        expect(geometry.footerBottom).toBeLessThanOrEqual(geometry.bottom);
        const save = await page
          .getByRole("button", { name: "Lưu cài đặt", exact: true })
          .boundingBox();
        expect(save!.y).toBeGreaterThanOrEqual(geometry.footerTop);
        await page.screenshot({
          path: testInfo.outputPath(
            theme === "Sáng" ? "settings-light.png" : "settings-dark.png",
          ),
        });
      }
      await page.getByLabel("Tập trung (phút)", { exact: true }).fill("0");
      await page
        .getByRole("button", { name: "Lưu cài đặt", exact: true })
        .click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(
        page.getByLabel("Tập trung (phút)", { exact: true }),
      ).toBeFocused();
    },
  );
}
