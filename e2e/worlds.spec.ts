import { test, expect, type Page } from "@playwright/test";
const worlds = [
  ["lavender", "Hiên mây tím"],
  ["academia", "Thư viện tĩnh"],
  ["forest", "Nhà bên rừng"],
  ["midnight", "Đài quan sát đêm"],
  ["rainy-cafe", "Quán bên mưa"],
  ["exam", "Góc ôn thi"],
] as const;
const saved = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("focus-flow")!).data);
async function gallery(page: Page) {
  await page.getByRole("button", { name: "Đổi thế giới", exact: true }).click();
}
async function apply(page: Page, name: string) {
  await page.getByRole("button", { name, exact: true }).click();
  await page
    .getByRole("button", { name: "Áp dụng thế giới", exact: true })
    .click();
}
test("world preview, cancel, favorites and reload preserve the active session", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await page
    .getByRole("button", { name: "Bắt đầu tập trung", exact: true })
    .click();
  const before = await saved(page);
  await gallery(page);
  await page
    .getByRole("button", { name: "Đài quan sát đêm", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-world", "midnight");
  expect((await saved(page)).settings.world).toBe("lavender");
  await page.getByRole("button", { name: "Hủy xem thử", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-world", "lavender");
  await gallery(page);
  await page
    .getByRole("button", { name: "Yêu thích Quán bên mưa", exact: true })
    .click();
  await apply(page, "Quán bên mưa");
  const after = await saved(page);
  expect(after.timer).toEqual(before.timer);
  expect(after.tasks).toEqual(before.tasks);
  expect(after.sessions).toEqual(before.sessions);
  expect(after.settings.favoriteWorlds).toContain("rainy-cafe");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute(
    "data-world",
    "rainy-cafe",
  );
  await expect(
    page.getByRole("button", { name: "Tạm dừng", exact: true }),
  ).toBeVisible();
  await gallery(page);
  await page.getByLabel("Chỉ hiện yêu thích", { exact: true }).check();
  await expect(page.locator(".world-choice")).toHaveCount(2);
  await page.keyboard.press("Escape");
  await page.clock.fastForward(1500000);
  await expect(page.getByLabel("Chế độ phiên")).toHaveValue("SHORT_BREAK");
  const rest = await saved(page);
  await gallery(page);
  await apply(page, "Nhà bên rừng");
  expect((await saved(page)).timer).toEqual(rest.timer);
});
test("world changes preserve an unsaved task, settings draft and analytics filter", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Thêm việc", exact: true }).click();
  await page
    .getByLabel("Tên việc học", { exact: true })
    .fill("Bản nháp phải còn nguyên");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Đổi thế giới", exact: true })
    .click();
  await apply(page, "Thư viện tĩnh");
  await expect(page.getByLabel("Tên việc học", { exact: true })).toHaveValue(
    "Bản nháp phải còn nguyên",
  );
  await page.getByRole("button", { name: "Tạo việc học", exact: true }).click();
  await page.getByRole("button", { name: "Mở cài đặt", exact: true }).click();
  await page.getByLabel("Tập trung (phút)", { exact: true }).fill("37");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Đổi thế giới", exact: true })
    .first()
    .click();
  await apply(page, "Góc ôn thi");
  await expect(
    page.getByLabel("Tập trung (phút)", { exact: true }),
  ).toHaveValue("37");
  await page.getByRole("button", { name: "Lưu cài đặt", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-world", "exam");
  await page.goto("/insights");
  await page.locator(".review-details > summary").click();
  await page
    .getByLabel("Khoảng thời gian tiến độ", { exact: true })
    .selectOption("30");
  await gallery(page);
  await apply(page, "Đài quan sát đêm");
  await expect(
    page.getByLabel("Khoảng thời gian tiến độ", { exact: true }),
  ).toHaveValue("30");
  await expect(page.locator(".review-details")).toHaveAttribute("open", "");
});
for (const width of [320, 390, 768, 1440])
  test(
    "six distinct worlds reflow in both lighting modes at " + width,
    async ({ page }, info) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      for (const [id, name] of worlds) {
        for (const light of ["Sáng", "Tối"]) {
          await gallery(page);
          await page.getByRole("button", { name, exact: true }).click();
          await page.getByRole("radio", { name: light, exact: true }).check();
          await page
            .getByRole("button", { name: "Áp dụng thế giới", exact: true })
            .click();
          await expect(page.locator("html")).toHaveAttribute("data-world", id);
          await expect(
            page.locator(".world-stage-scene [data-scene-world]"),
          ).toHaveAttribute("data-scene-world", id);
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          ).toBe(true);
          const geometry = await page.evaluate(() => {
            const scene = document
              .querySelector(".desk-focus")!
              .getBoundingClientRect();
            const timer = document
              .querySelector('[role="timer"]')!
              .getBoundingClientRect();
            const controls = document
              .querySelector(".flow-controls")!
              .getBoundingClientRect();
            return {
              contained:
                timer.left >= scene.left &&
                timer.right <= scene.right &&
                controls.bottom <= scene.bottom,
              overlap:
                timer.left < controls.right &&
                timer.right > controls.left &&
                timer.top < controls.bottom &&
                timer.bottom > controls.top,
            };
          });
          expect(geometry.contained).toBe(true);
          expect(geometry.overlap).toBe(false);
          if ([390, 1440].includes(width) && light === "Tối")
            await page.screenshot({
              path: info.outputPath(id + ".png"),
              fullPage: true,
            });
        }
      }
    },
  );
test("system lighting, motion preference and manual world choice persist", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto("/");
  await gallery(page);
  await page.getByRole("radio", { name: "Theo hệ thống", exact: true }).check();
  await apply(page, "Hiên mây tím");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(
    await page
      .locator(".world-stage-scene .scene-leaves")
      .first()
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");
  await page.getByRole("radio", { name: "Giải bài", exact: true }).check();
  await expect(page.locator("html")).toHaveAttribute("data-world", "lavender");
  await gallery(page);
  await page.getByLabel("Chuyển động nhẹ", { exact: true }).uncheck();
  await page
    .getByRole("button", { name: "Áp dụng thế giới", exact: true })
    .click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute(
    "data-world-motion",
    "off",
  );
});
for (const native of [false, true])
  test(
    (native ? "native picture in picture" : "fallback popup") +
      " keeps all timer digits visible at compact sizes",
    async ({ page }, info) => {
      if (!native)
        await page.addInitScript(() =>
          Object.defineProperty(window, "documentPictureInPicture", {
            value: undefined,
            configurable: true,
          }),
        );
      await page.goto("/");
      if (native)
        expect(
          await page.evaluate(() => "documentPictureInPicture" in window),
        ).toBe(true);
      await page
        .getByRole("button", { name: "Mở cài đặt", exact: true })
        .click();
      await page.getByLabel("Tập trung (phút)", { exact: true }).fill("180");
      await page
        .getByRole("button", { name: "Lưu cài đặt", exact: true })
        .click();
      const newWindow = page.context().waitForEvent("page");
      await page
        .getByRole("button", { name: "Đồng hồ nổi", exact: true })
        .click();
      const popup = await newWindow;
      await expect(popup.getByRole("timer")).toHaveText("180:00");
      for (const [width, height] of [
        [320, 180],
        [280, 140],
        [220, 100],
        [160, 70],
        [120, 60],
      ]) {
        await popup.setViewportSize({ width, height });
        const geometry = await popup.getByRole("timer").evaluate((element) => {
          const box = element.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(element);
          const text = range.getBoundingClientRect();
          return {
            visible:
              text.x >= 0 &&
              text.y >= 0 &&
              text.right <= innerWidth &&
              text.bottom <= innerHeight,
            clipped: text.width > box.width + 1,
            font: parseFloat(getComputedStyle(element).fontSize),
            overflow: document.documentElement.scrollWidth > innerWidth,
          };
        });
        expect(geometry.visible).toBe(true);
        expect(geometry.clipped).toBe(false);
        expect(geometry.font).toBeGreaterThanOrEqual(14);
        expect(geometry.overflow).toBe(false);
        await popup.screenshot({
          path: info.outputPath(width + "x" + height + ".png"),
        });
      }
      await popup
        .getByRole("button", { name: "Tiếp tục", exact: true })
        .click();
      await expect(
        page.getByRole("button", { name: "Tạm dừng", exact: true }),
      ).toBeVisible();
      await popup
        .getByRole("button", { name: "Tạm dừng", exact: true })
        .click();
      await expect(page).toHaveTitle(/Tạm dừng/);
      await popup.close();
    },
  );

test("empty favorites and blocked popups show useful recovery", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "documentPictureInPicture", {
      value: undefined,
      configurable: true,
    });
    window.open = () => null;
  });
  await page.goto("/");
  await gallery(page);
  await page
    .getByRole("button", { name: "Bỏ yêu thích Hiên mây tím", exact: true })
    .click();
  await page.getByLabel("Chỉ hiện yêu thích", { exact: true }).check();
  await expect(page.getByRole("status")).toContainText(
    "Chưa có thế giới yêu thích",
  );
  await page.getByLabel("Chỉ hiện yêu thích", { exact: true }).uncheck();
  await expect(page.locator(".world-choice")).toHaveCount(6);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Đổi thế giới", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Đồng hồ nổi", exact: true }).click();
  await expect(page.locator(".mini-message")).toContainText(
    "Hãy cho phép cửa sổ bật lên",
  );
  await expect(page.getByRole("timer")).toHaveText("25:00");
});
