import { expect, test, type Page } from "@playwright/test";

async function checkAlignment(page: Page) {
  const geometry = await page.evaluate(() => {
    const box = (selector: string) =>
      document.querySelector(selector)!.getBoundingClientRect();
    const orb = box(".flow-orb");
    const digits = box("[role=timer]");
    const room = box(".flow-room-wrap");
    const tasks = box(".desk-notebook");
    const picker = box(".flow-current-task");
    const controls = box(".flow-controls");
    const buttons = [
      ...document.querySelectorAll(".flow-controls > button"),
    ].map((element) => element.getBoundingClientRect());
    const header = box(".flow-header");
    return {
      overflow: document.documentElement.scrollWidth - innerWidth,
      orbRatio: Math.abs(orb.width - orb.height),
      timerCenter: Math.abs(
        digits.x + digits.width / 2 - orb.x - orb.width / 2,
      ),
      pickerLeft: Math.abs(picker.x - controls.x),
      pickerWidth: Math.abs(picker.width - controls.width),
      buttonTop:
        Math.max(...buttons.map((rect) => rect.y)) -
        Math.min(...buttons.map((rect) => rect.y)),
      buttonBottom:
        Math.max(...buttons.map((rect) => rect.bottom)) -
        Math.min(...buttons.map((rect) => rect.bottom)),
      controlsBottom: controls.bottom - room.bottom,
      headerBottom: header.bottom - room.top,
      stacked: tasks.top >= room.bottom,
      panelTop: Math.abs(tasks.top - room.top),
      panelBottom: Math.abs(tasks.bottom - room.bottom),
    };
  });
  expect(geometry.overflow).toBeLessThanOrEqual(0);
  expect(geometry.orbRatio).toBeLessThan(1);
  expect(geometry.timerCenter).toBeLessThan(1);
  expect(geometry.pickerLeft).toBeLessThan(1);
  expect(geometry.pickerWidth).toBeLessThan(1);
  expect(geometry.buttonTop).toBeLessThan(1);
  expect(geometry.buttonBottom).toBeLessThan(1);
  expect(geometry.controlsBottom).toBeLessThan(0);
  expect(geometry.headerBottom).toBeLessThan(0);
  if (!geometry.stacked) {
    expect(geometry.panelTop).toBeLessThan(1);
    expect(geometry.panelBottom).toBeLessThan(1);
  }
}

for (const [width, height] of [
  [320, 640],
  [390, 844],
  [720, 600],
  [768, 600],
  [1024, 768],
  [1280, 720],
  [1440, 900],
  [1920, 1080],
]) {
  test(
    "layout remains aligned at " + width + "x" + height,
    async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height });
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);
      await checkAlignment(page);
      if (width > 760) {
        const sidebar = await page.locator(".sidebar").boundingBox();
        const collapse = await page
          .getByRole("button", { name: "Thu gọn thanh bên", exact: true })
          .boundingBox();
        expect(sidebar!.y + sidebar!.height).toBeLessThanOrEqual(height);
        expect(collapse!.y + collapse!.height).toBeLessThanOrEqual(
          sidebar!.y + sidebar!.height,
        );
        for (const label of await page.locator(".sidebar .nav-label").all()) {
          const dimensions = await label.evaluate((element) => ({
            height: element.getBoundingClientRect().height,
            lineHeight: parseFloat(getComputedStyle(element).lineHeight),
          }));
          expect(dimensions.height).toBeLessThanOrEqual(
            dimensions.lineHeight + 1,
          );
        }
        await page
          .getByRole("button", { name: "Thu gọn thanh bên", exact: true })
          .click();
        await checkAlignment(page);
        const compact = await page.locator(".sidebar").boundingBox();
        for (const link of await page.locator(".sidebar .nav a").all()) {
          const bounds = await link.boundingBox();
          expect(bounds!.x).toBeGreaterThan(compact!.x);
          expect(bounds!.x + bounds!.width).toBeLessThan(
            compact!.x + compact!.width,
          );
        }
        await page
          .getByRole("button", { name: "Mở thanh bên", exact: true })
          .click();
      } else {
        await expect(page.locator(".sidebar")).toBeHidden();
        await expect(
          page.getByRole("navigation", { name: "Điều hướng di động" }),
        ).toBeVisible();
      }
      if ([390, 1280, 1440].includes(width)) {
        await page.screenshot({
          path: testInfo.outputPath("layout.png"),
          fullPage: true,
        });
      }
    },
  );
}

test("long task titles and maximum timer duration stay inside their controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  await page.getByRole("button", { name: "Thêm việc", exact: true }).click();
  const title =
    "Ôn tập chương phương trình lượng giác và hoàn thành toàn bộ bài luyện tập cuối chương";
  await page.getByLabel("Tên việc học", { exact: true }).fill(title);
  await page.getByRole("button", { name: "Tạo việc học", exact: true }).click();
  await page.locator(".flow-task .task-title").click();
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 720 });
    await checkAlignment(page);
    const row = await page.locator(".flow-task").boundingBox();
    const actions = await page
      .getByRole("button", { name: "Sửa " + title })
      .boundingBox();
    expect(actions!.x + actions!.width).toBeLessThanOrEqual(
      row!.x + row!.width + 1,
    );
  }
  await page.getByRole("button", { name: "Mở cài đặt", exact: true }).click();
  await page.getByLabel("Tập trung (phút)", { exact: true }).fill("180");
  await page.getByRole("button", { name: "Lưu cài đặt", exact: true }).click();
  await page.reload();
  await page.setViewportSize({ width: 320, height: 640 });
  await expect(page.getByRole("timer")).toHaveText("180:00");
  const timer = await page.getByRole("timer").boundingBox();
  const orb = await page.locator(".flow-orb").boundingBox();
  expect(timer!.x).toBeGreaterThan(orb!.x);
  expect(timer!.x + timer!.width).toBeLessThan(orb!.x + orb!.width);
  await checkAlignment(page);
});

test("mobile keyboard focus stays above the fixed navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/");
  for (let index = 0; index < 43; index++) {
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => {
      const element = document.activeElement;
      if (!(element instanceof HTMLElement) || element === document.body)
        return null;
      const rect = element.getBoundingClientRect();
      const navigation = document
        .querySelector(".mobile-nav")!
        .getBoundingClientRect();
      return {
        top: rect.top,
        bottom: rect.bottom,
        limit: element.closest(".mobile-nav") ? innerHeight : navigation.top,
      };
    });
    if (focused) {
      expect(focused.top).toBeGreaterThanOrEqual(0);
      expect(focused.bottom).toBeLessThanOrEqual(focused.limit + 1);
    }
  }
});
