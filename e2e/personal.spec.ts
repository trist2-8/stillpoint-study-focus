import { test, expect } from "@playwright/test";

test("personal study loop remembers subject, task, journal and next step", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("button", { name: "Thêm môn", exact: true }).click();
  await page.getByLabel("Tên môn học", { exact: true }).fill("Tiếng Anh");
  await page
    .getByLabel("Ghi chú của môn", { exact: true })
    .fill("Đọc truyện mỗi ngày");
  await page.getByRole("button", { name: "Lưu môn học", exact: true }).click();
  await page.getByRole("button", { name: "Thêm việc", exact: true }).click();
  await page.getByLabel("Tên việc học", { exact: true }).fill("Đọc chương 2");
  await expect(page.getByLabel("Môn học", { exact: true })).not.toHaveValue("");
  await page.getByRole("button", { name: "Tạo việc học", exact: true }).click();
  await page.getByRole("button", { name: "Mở cài đặt", exact: true }).click();
  await page.getByLabel("Tập trung (phút)", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Lưu cài đặt", exact: true }).click();
  await page.getByRole("radio", { name: "Đọc tài liệu", exact: true }).check();
  await page
    .getByRole("button", { name: "Bắt đầu tập trung", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Góc học chung", exact: true }),
  ).toBeDisabled();
  await page
    .getByLabel("Ý nghĩ chen ngang", { exact: true })
    .fill("Tìm cuốn sách tiếp theo");
  await page
    .getByRole("button", { name: "Ghi lại để sau", exact: true })
    .click();
  await page.clock.fastForward(60000);
  await expect(page.getByLabel("Chế độ phiên")).toHaveValue("SHORT_BREAK");
  await page
    .getByLabel("Đã làm được gì?", { exact: true })
    .fill("Đọc xong 5 trang");
  await page
    .getByLabel("Đang vướng ở đâu?", { exact: true })
    .fill("Cần tra từ mới");
  await page
    .getByLabel("Lần sau bắt đầu từ đâu?", { exact: true })
    .fill("Tiếp tục trang 6");
  await page.reload();
  await expect(
    page.getByLabel("Lần sau bắt đầu từ đâu?", { exact: true }),
  ).toHaveValue("Tiếp tục trang 6");
  await page.getByRole("button", { name: "Lưu nhật ký", exact: true }).click();
  await expect(page.locator(".next-step-note")).toContainText(
    "Tiếp tục trang 6",
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: testInfo.outputPath("personal-desk-filled.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Chỉnh nhật ký", exact: true })
    .click();
  await expect(
    page.getByLabel("Lần sau bắt đầu từ đâu?", { exact: true }),
  ).toHaveValue("Tiếp tục trang 6");
  await page.getByRole("button", { name: "Lưu nhật ký", exact: true }).click();
  await page.goto("/insights");
  await expect(page.locator(".review-subjects")).toContainText("Tiếng Anh");
  await page.locator(".journal-history summary").click();
  await expect(page.locator(".journal-history")).toContainText(
    "Đọc xong 5 trang",
  );
  await expect(page.locator(".journal-history")).toContainText(
    "Tiếp tục trang 6",
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: testInfo.outputPath("weekly-review.png"),
    fullPage: true,
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Đặt lại phiên", exact: true })
    .click();
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await page
    .getByRole("button", { name: "Góc học chung", exact: true })
    .click();
  await expect(page.locator(".next-step-note")).toHaveCount(0);
  await page.getByRole("button", { name: "Sổ học", exact: true }).click();
  await expect(page.locator(".notebook-empty")).toBeVisible();
  await page.getByRole("button", { name: "Tiếng Anh", exact: true }).click();
  await expect(page.locator(".next-step-note")).toContainText(
    "Tiếp tục trang 6",
  );
  await page.getByText("Xem các ghi chú", { exact: false }).click();
  await expect(
    page.getByLabel("Tìm cuốn sách tiếp theo", { exact: true }),
  ).not.toBeChecked();
  await page.getByLabel("Tìm cuốn sách tiếp theo", { exact: true }).check();
  await page.reload();
  await page.getByText("Xem các ghi chú", { exact: false }).click();
  await expect(
    page.getByLabel("Tìm cuốn sách tiếp theo", { exact: true }),
  ).toBeChecked();
});

for (const width of [320, 390, 768, 1280, 1440])
  test(
    "personal desk layout and keyboard at " + width,
    async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await expect(
        page.getByRole("heading", { name: "Hôm nay của bạn." }),
      ).toBeVisible();
      await page.getByRole("button", { name: "Thêm môn", exact: true }).click();
      const modal = await page.getByRole("dialog").boundingBox();
      expect(Math.abs(modal!.x - (width - modal!.width) / 2)).toBeLessThan(1);
      expect(Math.abs(modal!.y - (900 - modal!.height) / 2)).toBeLessThan(1);
      await page
        .getByRole("button", { name: "Đóng hộp thoại", exact: true })
        .click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.getByRole("button", { name: "Bàn học", exact: true }).click();
      const desk = await page.locator(".desk-focus").boundingBox();
      const notebook = await page.locator(".desk-notebook").boundingBox();
      expect(
        notebook!.x >= desk!.x + desk!.width - 1 ||
          notebook!.y >= desk!.y + desk!.height - 1,
      ).toBe(true);
      await page.screenshot({
        path: testInfo.outputPath("desk.png"),
        fullPage: true,
      });
      await page
        .getByRole("button", { name: "Mở cài đặt", exact: true })
        .click();
      await page.getByLabel("Ngôn ngữ", { exact: true }).selectOption("en");
      await page
        .getByRole("button", { name: "Lưu cài đặt", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Dismiss notification", exact: true })
        .click();
      await expect(
        page.getByRole("heading", { name: "Your day, your pace." }),
      ).toBeVisible();
      for (const path of ["/", "/tasks", "/insights"]) {
        await page.goto(path);
        expect(
          (await page.locator("body").innerText()).replace("Café", "Cafe"),
        ).not.toMatch(/[À-ỹ]/);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
      }
    },
  );
