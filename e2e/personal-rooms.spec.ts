import { test, expect } from "@playwright/test";
const state = (page: import("@playwright/test").Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("focus-flow")!).data);
test("general study tasks remain editable while the original session keeps its identity", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("button", { name: "Thêm môn", exact: true }).click();
  await page.getByLabel("Tên môn học", { exact: true }).fill("Toán");
  await page.getByRole("button", { name: "Lưu môn học", exact: true }).click();
  await page.getByRole("button", { name: "Thêm việc", exact: true }).click();
  await page.getByLabel("Tên việc học", { exact: true }).fill("Bài tập Toán");
  await page.getByRole("button", { name: "Tạo việc học", exact: true }).click();
  await page.getByRole("button", { name: "Mở cài đặt", exact: true }).click();
  await page.getByLabel("Tập trung (phút)", { exact: true }).fill("1");
  await page.getByLabel("Nghỉ ngắn (phút)", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Lưu cài đặt", exact: true }).click();
  await page
    .getByRole("button", { name: "Bắt đầu tập trung", exact: true })
    .click();
  const before = await state(page);
  await page
    .getByRole("button", { name: "Góc học chung", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Thêm việc vào góc học", exact: true })
    .click();
  await page.getByLabel("Tên việc học", { exact: true }).fill("Đọc sách");
  await expect(page.getByLabel("Môn học", { exact: true })).toHaveValue("");
  await page.getByRole("button", { name: "Tạo việc học", exact: true }).click();
  await page.getByRole("button", { name: "Sửa Đọc sách", exact: true }).click();
  await page
    .getByLabel("Tên việc học", { exact: true })
    .fill("Đọc 10 trang sách");
  await page.getByRole("button", { name: /Lưu thay đổi|Lưu việc học/ }).click();
  await page.getByRole("radio", { name: "Viết", exact: true }).check();
  const after = await state(page);
  expect(after.timer).toEqual(before.timer);
  expect(after.personal.activeSubjectId).toBeNull();
  expect(
    after.tasks.find(
      (item: { title: string }) => item.title === "Đọc 10 trang sách",
    ).subjectId,
  ).toBeNull();
  await page.clock.fastForward(60000);
  expect((await state(page)).sessions[0]).toMatchObject({
    subjectId: before.timer.subjectId,
    goal: "read",
  });
  await page.clock.fastForward(60000);
  expect((await state(page)).timer).toMatchObject({
    subjectId: before.timer.subjectId,
    goal: "write",
    status: "RUNNING",
  });
});
test("custom artwork previews, cancels and persists locally without changing the timer", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await page
    .getByRole("button", { name: "Bắt đầu tập trung", exact: true })
    .click();
  const before = await state(page);
  await page.getByRole("button", { name: "Đổi thế giới", exact: true }).click();
  await page
    .getByLabel("Chọn ảnh cho phòng", { exact: true })
    .setInputFiles("public/rooms/forest.jpg");
  await expect(page.locator(".world-stage-scene img")).toHaveAttribute(
    "src",
    /^blob:/,
  );
  await page.getByRole("button", { name: "Hủy xem thử", exact: true }).click();
  await expect(page.locator(".world-stage-scene img")).toHaveAttribute("src", "/worlds/lavender-room.webp");
  await page.getByRole("button", { name: "Đổi thế giới", exact: true }).click();
  await page.getByLabel("Chọn ảnh cho phòng", { exact: true }).setInputFiles({
    name: "bad.png",
    mimeType: "image/png",
    buffer: Buffer.from("invalid"),
  });
  await expect(page.getByRole("alert")).toContainText("Chọn ảnh PNG");
  await page
    .getByLabel("Chọn ảnh cho phòng", { exact: true })
    .setInputFiles("public/rooms/library.jpg");
  await page
    .getByRole("button", { name: "Áp dụng thế giới", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".world-stage-scene img")).toHaveAttribute(
    "src",
    /^blob:/,
  );
  expect((await state(page)).timer).toEqual(before.timer);
  await page.reload();
  await expect(page.locator(".world-stage-scene img")).toHaveAttribute(
    "src",
    /^blob:/,
  );
  await expect
    .poll(() =>
      page
        .locator(".world-stage-scene img")
        .evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(600);
  expect((await state(page)).timer).toEqual(before.timer);
});
test("real sound layers keep playing across routes and pause after reload", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const OriginalAudio = window.Audio;
    (window as unknown as { testAudio: HTMLAudioElement[] }).testAudio = [];
    window.Audio = class extends OriginalAudio {
      constructor(source?: string) {
        super(source);
        (window as unknown as { testAudio: HTMLAudioElement[] }).testAudio.push(
          this,
        );
      }
    };
  });
  await page.goto("/");
  const recordings = () =>
    page.evaluate(() =>
      (window as unknown as { testAudio: HTMLAudioElement[] }).testAudio.map(
        (audio) => ({
          src: audio.src,
          paused: audio.paused,
          volume: audio.volume,
          ready: audio.readyState,
        }),
      ),
    );
  expect(await recordings()).toEqual([]);
  await page.getByRole("button", { name: "Âm thanh", exact: true }).click();
  await page
    .getByRole("button", { name: "Chim trong vườn", exact: true })
    .click();
  await page.getByRole("button", { name: "Lửa lò sưởi", exact: true }).click();
  await expect
    .poll(
      async () =>
        (await recordings()).filter(
          (audio) => !audio.paused && audio.ready >= 2,
        ).length,
    )
    .toBe(2);
  await page
    .getByRole("slider", { name: "Âm lượng chung", exact: true })
    .press("End");
  await page
    .getByRole("slider", { name: "Âm lượng Chim trong vườn", exact: true })
    .press("ArrowRight");
  await expect
    .poll(
      async () =>
        (await recordings()).find((audio) => audio.src.includes("birds"))
          ?.volume,
    )
    .toBe(0.31);
  await page
    .getByRole("button", { name: "Đóng hộp thoại", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "Điều hướng chính", exact: true })
    .getByRole("link", { name: "Việc học", exact: true })
    .click();
  expect((await recordings()).filter((audio) => !audio.paused)).toHaveLength(2);
  await page.getByRole("button", { name: /^Âm thanh/ }).click();
  await page.getByRole("button", { name: "Tắt tất cả", exact: true }).click();
  await expect
    .poll(async () => (await recordings()).every((audio) => audio.paused))
    .toBe(true);
  await page.getByRole("button", { name: "Phát bộ trộn", exact: true }).click();
  await expect
    .poll(
      async () => (await recordings()).filter((audio) => !audio.paused).length,
    )
    .toBe(2);
  await page.reload();
  expect(await recordings()).toEqual([]);
  await page.getByRole("button", { name: "Âm thanh", exact: true }).click();
  await expect(
    page.getByRole("slider", { name: "Âm lượng chung", exact: true }),
  ).toHaveValue("100");
  await expect(
    page.getByRole("button", { name: "Phát bộ trộn", exact: true }),
  ).toBeEnabled();
});
test("a failed audio file leaves other controls usable", async ({ page }) => {
  await page.route("**/audio/wind.ogg", (route) => route.abort());
  await page.goto("/");
  await page.getByRole("button", { name: "Âm thanh", exact: true }).click();
  await page
    .getByRole("button", { name: "Gió qua tán lá", exact: true })
    .click();
  await expect(page.locator(".sound-dialog .error[role=status]")).toContainText(
    "Chưa phát được tiếng này",
  );
  await expect(
    page.getByRole("button", { name: "Gió qua tán lá", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button",{name:"Thử lại Gió qua tán lá",exact:true})).toBeVisible();
  await page.getByRole("button", { name: "Lửa lò sưởi", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Lửa lò sưởi", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});
for (const width of [390, 1440])
  test(
    "room catalogue, sound mixer and immersive controls fit at " + width,
    async ({ page }, info) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await page
        .getByRole("button", { name: "Đổi thế giới", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Quán bên mưa", exact: true })
        .click();
      await page.screenshot({ path: info.outputPath("catalogue.png") });
      await page
        .getByRole("button", { name: "Áp dụng thế giới", exact: true })
        .click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: info.outputPath("room.png"),
        fullPage: true,
      });
      await page.getByRole("button", { name: "Âm thanh", exact: true }).click();
      expect(
        await page
          .getByRole("dialog")
          .evaluate((element) => element.scrollWidth <= element.clientWidth),
      ).toBe(true);
      await page.screenshot({ path: info.outputPath("sounds.png") });
    },
  );

test("quiet room view keeps the running timer and restores task controls", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await page
    .getByRole("button", { name: "Bắt đầu tập trung", exact: true })
    .click();
  const before = await state(page);
  await page.getByRole("button", { name: "Ngắm phòng", exact: true }).click();
  await expect(page.getByRole("timer")).toBeVisible();
  await expect(page.locator(".subject-shelf")).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Tạm dừng", exact: true }),
  ).toBeVisible();
  expect((await state(page)).timer).toEqual(before.timer);
  await page.getByRole("button", { name: "Quay lại học", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Thêm việc vào góc học", exact: true }),
  ).toBeVisible();
  expect((await state(page)).timer).toEqual(before.timer);
});

test("every bundled recording decodes and room tools use English consistently", async ({
  page,
}) => {
  await page.goto("/");
  const durations = await page.evaluate(async () => {
    const audio = new AudioContext();
    try {
      const values = [];
      for (const name of [
        "birds",
        "stream",
        "wind",
        "fireplace",
        "coffee-shop",
        "summer-night",
        "boat",
      ]) {
        const response = await fetch("/audio/" + name + ".ogg");
        const buffer = await audio.decodeAudioData(
          await response.arrayBuffer(),
        );
        values.push({
          name,
          duration: buffer.duration,
          channels: buffer.numberOfChannels,
        });
      }
      return values;
    } finally {
      await audio.close();
    }
  });
  expect(durations).toHaveLength(7);
  for (const sound of durations) expect(sound.duration).toBeGreaterThan(5);
  await page.getByRole("button", { name: "Mở cài đặt", exact: true }).click();
  await page.getByLabel("Ngôn ngữ", { exact: true }).selectOption("en");
  await page.getByRole("button", { name: "Lưu cài đặt", exact: true }).click();
  await page.getByRole("button", { name: "Sounds", exact: true }).click();
  expect(await page.getByRole("dialog").innerText()).not.toMatch(/[À-ỹ]/);
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page.getByRole("button", { name: "Change world", exact: true }).click();
  expect(
    (await page.getByRole("dialog").innerText()).replaceAll("Café", "Cafe"),
  ).not.toMatch(/[À-ỹ]/);
});
