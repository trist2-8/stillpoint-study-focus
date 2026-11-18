import { test, expect } from "@playwright/test";
test("native floating window rejection and timeout always offer a working fallback", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "documentPictureInPicture", {
      configurable: true,
      value: {
        requestWindow: () =>
          Promise.reject(new DOMException("denied", "NotAllowedError")),
      },
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Đồng hồ nổi", exact: true }).click();
  await expect(page.locator(".floating-feedback")).toContainText(
    "Trình duyệt này chưa mở được",
  );
  const opened = page.waitForEvent("popup");
  await page
    .getByRole("button", { name: "Mở cửa sổ thường", exact: true })
    .click();
  const child = await opened;
  await expect(child.getByRole("timer")).toHaveText("25:00");
  await child.close();
  await page.evaluate(() =>
    Object.defineProperty(window, "documentPictureInPicture", {
      configurable: true,
      value: { requestWindow: () => new Promise(() => {}) },
    }),
  );
  await page.getByRole("button", { name: "Đồng hồ nổi", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Đồng hồ nổi", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Mở cửa sổ thường", exact: true }),
  ).toBeVisible({ timeout: 5500 });
  const feedback = page.locator(".floating-feedback").boundingBox();
  const timer = page.getByRole("timer").boundingBox();
  const feedbackBox = await feedback;
  const timerBox = await timer;
  expect(feedbackBox!.y + feedbackBox!.height).toBeLessThanOrEqual(timerBox!.y);
  await page
    .getByRole("button", { name: "Đóng thông báo", exact: true })
    .click();
  await expect(page.locator(".floating-feedback")).toHaveCount(0);
});
test("pending audio becomes retryable and master buttons stay in place", async ({
  page,
}) => {
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = function () {
      return new Promise(() => {});
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Âm thanh", exact: true }).click();
  const play = page.getByRole("button", { name: "Phát bộ trộn", exact: true });
  const pause = page.getByRole("button", { name: "Tắt tất cả", exact: true });
  const before = [await play.boundingBox(), await pause.boundingBox()];
  await page
    .getByRole("button", { name: "Chim trong vườn", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Chim trong vườn", exact: true }),
  ).toContainText("Đang tải");
  await expect(
    page.getByRole("button", { name: "Thử lại Chim trong vườn", exact: true }),
  ).toBeVisible({ timeout: 6500 });
  expect([await play.boundingBox(), await pause.boundingBox()]).toEqual(before);
  await expect(page.locator(".sound-dialog .error")).toBeVisible();
  await expect(play).toBeEnabled();
});
for (const [width, height] of [
  [1920, 942],
  [1440, 900],
  [1280, 720],
  [390, 844],
  [320, 740],
])
  test(
    "timer and task footer fit " + width + "x" + height,
    async ({ page }, info) => {
      await page.setViewportSize({ width, height });
      await page.goto("/");
      await page
        .getByRole("button", { name: "Mở cài đặt", exact: true })
        .click();
      await expect(
        page
          .getByRole("dialog")
          .getByRole("button", { name: "Đổi thế giới", exact: true }),
      ).toHaveCount(0);
      await expect(page.locator(".settings-world-grid input")).toHaveCount(6);
      await expect(page.locator(".settings-save-state")).toContainText(
        "Chưa có thay đổi mới",
      );
      await page.getByLabel("Tập trung (phút)", { exact: true }).fill("180");
      await page
        .getByRole("radio", { name: "Đài quan sát đêm", exact: true })
        .check();
      await page
        .getByRole("button", { name: "Lưu cài đặt", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Đóng thông báo", exact: true })
        .click();
      await page.evaluate(() => scrollTo(0, 0));
      for (const quiet of [false, true]) {
        if (quiet)
          await page
            .getByRole("button", { name: "Ngắm phòng", exact: true })
            .click();
        const geometry = await page.evaluate(() => {
          const dock = document
            .querySelector(".flow-orb-area")!
            .getBoundingClientRect();
          const digits = document
            .querySelector('[role="timer"]')!
            .getBoundingClientRect();
          const nav = document
            .querySelector(".mobile-nav")!
            .getBoundingClientRect();
          return {
            bottom: dock.bottom,
            limit: innerWidth <= 760 ? nav.top : innerHeight,
            left: digits.left,
            right: digits.right,
            dockLeft: dock.left,
            dockRight: dock.right,
            overflow: document.documentElement.scrollWidth > innerWidth,
          };
        });
        expect(geometry.bottom).toBeLessThanOrEqual(geometry.limit);
        expect(geometry.left).toBeGreaterThanOrEqual(geometry.dockLeft);
        expect(geometry.right).toBeLessThanOrEqual(geometry.dockRight);
        expect(geometry.overflow).toBe(false);
        await page.screenshot({
          path: info.outputPath(quiet ? "quiet.png" : "study.png"),
        });
      }
      await page
        .getByRole("button", { name: "Quay lại học", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Thêm việc vào góc học", exact: true })
        .click();
      await expect(
        page
          .getByRole("dialog")
          .getByRole("button", { name: "Đổi thế giới", exact: true }),
      ).toHaveCount(0);
      for (const name of ["Hủy", "Tạo việc học"]) {
        const bounds = await page
          .getByRole("button", { name, exact: true })
          .boundingBox();
        expect(bounds!.y).toBeGreaterThanOrEqual(0);
        expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(height);
      }
      await expect(
        page.getByLabel("Hạn hoàn thành (không bắt buộc)"),
      ).toHaveAttribute("placeholder", "dd/mm/yyyy");
      await page
        .getByLabel("Tên việc học", { exact: true })
        .fill("Bài học thử");
      await page
        .getByLabel("Hạn hoàn thành (không bắt buộc)")
        .fill("25/11/2026");
      await page
        .getByRole("button", { name: "Tạo việc học", exact: true })
        .click();
      expect(
        await page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("focus-flow")!).data.tasks[0].dueAt,
        ),
      ).toBe("2026-11-25");
    },
  );
test("all supplied artworks match Desk and room motion respects preferences", async ({
  page,
}) => {
  await page.goto("/");
  for (const [id, name] of [
    ["lavender", "Hiên mây tím"],
    ["academia", "Thư viện tĩnh"],
    ["forest", "Nhà bên rừng"],
    ["midnight", "Đài quan sát đêm"],
    ["rainy-cafe", "Quán bên mưa"],
    ["exam", "Góc ôn thi"],
  ]) {
    await page
      .getByRole("button", { name: "Đổi thế giới", exact: true })
      .click();
    await page.getByRole("button", { name, exact: true }).click();
    await page
      .getByRole("button", { name: "Áp dụng thế giới", exact: true })
      .click();
    await expect(page.locator(".immersive-backdrop img")).toHaveAttribute(
      "src",
      "/worlds/" + id + "-room.webp",
    );
    await expect
      .poll(() =>
        page
          .locator(".immersive-backdrop img")
          .evaluate((image: HTMLImageElement) => image.naturalWidth),
      )
      .toBe(2048);
    expect(
      await page
        .locator(".immersive-backdrop .room-effects")
        .evaluate((element) => element.getAnimations({ subtree: true }).length),
    ).toBeGreaterThan(0);
    await page.getByRole("button", { name: "Bàn học", exact: true }).click();
    await expect(page.locator(".desk-room img")).toHaveAttribute(
      "src",
      "/worlds/" + id + "-room.webp",
    );
    await page.getByRole("button", { name: "Toàn cảnh", exact: true }).click();
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".immersive-backdrop .room-effects")).toBeHidden();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByRole("button", { name: "Mở cài đặt", exact: true }).click();
  await page
    .getByRole("checkbox", { name: "Chuyển động trong phòng", exact: true })
    .uncheck();
  await page.getByRole("button", { name: "Lưu cài đặt", exact: true }).click();
  await expect(page.locator(".immersive-backdrop .room-effects")).toBeHidden();
});
test("empty task picker explains next step and notebook is a real route", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Chọn việc cho phiên này", exact: true })
    .click();
  await expect(page.locator(".task-picker-empty")).toContainText(
    "Chưa có việc",
  );
  await page
    .getByRole("navigation", { name: "Điều hướng chính", exact: true })
    .getByRole("link", { name: "Sổ học", exact: true })
    .click();
  await expect(page).toHaveURL("/notebook");
  await expect(
    page.getByRole("heading", { name: "Sổ học của bạn", exact: true }),
  ).toBeVisible();
});
