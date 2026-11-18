import { test, expect } from "@playwright/test";

test("English applies across routes and survives reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Mở cài đặt", exact: true }).click();
  await page.getByLabel("Ngôn ngữ", { exact: true }).selectOption("en");
  await page.getByRole("button", { name: "Lưu cài đặt", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("status").filter({ hasText: "Study room settings saved." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Your day, your pace." }),
  ).toBeVisible();
  await expect(page.getByLabel("Session mode")).toHaveValue("FOCUS");
  for (const path of ["/tasks", "/insights", "/notebook", "/"]) {
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/[À-ỹ]/);
  }
  await page
    .getByRole("button", { name: "Open settings", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveAttribute(
    "aria-label",
    "Study room settings",
  );
  const text = await page.getByRole("dialog").innerText();
  expect(text.replace("Tiếng Việt", " ").replace("Café", "Cafe")).not.toMatch(
    /[À-ỹ]/,
  );
  expect(text).not.toContain("\\n");
  await page.getByLabel("Language", { exact: true }).selectOption("vi");
  await page
    .getByRole("button", { name: "Save settings", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
});

test("room images persist and remain aligned on mobile", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Bàn học", exact: true }).click();
  for (const scene of ["Thư viện tĩnh", "Quán bên mưa", "Nhà bên rừng"]) {
    await page.getByRole("button", { name: "Mở cài đặt", exact: true }).click();
    await page.getByRole("radio", { name: scene, exact: true }).check();
    await page
      .getByRole("button", { name: "Lưu cài đặt", exact: true })
      .click();
    await expect(page.locator(".desk-room img")).toBeVisible();
    expect(
      await page
        .locator(".desk-room img")
        .evaluate(
          (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
        ),
    ).toBe(true);
  }
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.reload();
    await expect(page.locator(".desk-room img")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath("room-" + width + ".png"),
      fullPage: true,
    });
  }
});

test("export and restore preview protect existing data", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Thêm việc", exact: true }).click();
  await page.getByLabel("Tên việc học").fill("Bài học của tôi");
  await page.getByRole("button", { name: "Tạo việc học", exact: true }).click();
  await page.getByRole("button", { name: "Mở cài đặt", exact: true }).click();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Tải bản sao lưu", exact: true })
    .click();
  const file = await download;
  expect(file.suggestedFilename()).toContain("focus-flow-backup");
  const path = await file.path();
  await page.getByLabel("Tệp sao lưu", { exact: true }).setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"application":"focus-flow","version":1,"data":{}}'),
  });
  await expect(
    page.getByRole("status").filter({ hasText: "Tệp sao lưu không hợp lệ" }),
  ).toBeVisible();
  await page.getByLabel("Tệp sao lưu", { exact: true }).setInputFiles(path!);
  await expect(
    page.getByRole("group", { name: "Xác nhận khôi phục" }),
  ).toContainText("1 việc học");
  await page
    .getByRole("button", { name: "Xác nhận khôi phục", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Bài học của tôi", exact: true }),
  ).toBeVisible();
});

test("floating timer stays linked when navigating and its controls work", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "documentPictureInPicture", {
      value: undefined,
      configurable: true,
    }),
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "Bắt đầu tập trung", exact: true })
    .click();
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Đồng hồ nổi", exact: true }).click();
  const popup = await popupPromise;
  await expect(popup.getByRole("timer")).toBeVisible();
  await page
    .getByRole("navigation", { name: "Điều hướng chính" })
    .getByRole("link", { name: "Việc học", exact: true })
    .click();
  await popup.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  await expect(page).toHaveTitle(/Tạm dừng/);
  await popup.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await expect(page).toHaveTitle(/Tập trung/);
  await popup.close();
  await page.goto("/");
  await expect(page.getByRole("timer")).toBeVisible();
});
