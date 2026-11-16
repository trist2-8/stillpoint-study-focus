import { test, expect } from "@playwright/test";
import { defaults } from "../src/types";

test("signed-in sync inspects remote data, uploads by revision and confirms download", async ({
  page,
}) => {
  const user = {
    id: "11111111-1111-4111-8111-111111111111",
    email: "learner@example.test",
    aud: "authenticated",
    role: "authenticated",
    app_metadata: {},
    user_metadata: {},
    created_at: new Date().toISOString(),
  };
  const accessToken =
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
      "base64url",
    ) +
    "." +
    Buffer.from(
      JSON.stringify({
        sub: user.id,
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    ).toString("base64url") +
    ".test";
  await page.addInitScript(
    ({ user, accessToken }) => {
      localStorage.setItem(
        "sb-sync-test-auth-token",
        JSON.stringify({
          access_token: accessToken,
          refresh_token: "test-refresh",
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          expires_in: 3600,
          token_type: "bearer",
          user,
        }),
      );
    },
    { user, accessToken },
  );
  let revision = 2;
  let reads = 0;
  let uploads = 0;
  let conflict = false;
  await page.route("https://sync-test.supabase.co/**", async (route) => {
    const url = route.request().url();
    const headers = {
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "content-type": "application/json",
    };
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 200, headers, body: "" });
      return;
    }
    if (url.includes("/auth/v1/user")) {
      await route.fulfill({ status: 200, headers, body: JSON.stringify(user) });
      return;
    }
    if (url.includes("/rpc/save_study_backup")) {
      uploads++;
      expect(route.request().postDataJSON().expected_revision).toBe(revision);
      if (conflict) {
        await route.fulfill({
          status: 409,
          headers,
          body: JSON.stringify({
            message: "Cloud copy changed",
            code: "P0001",
          }),
        });
        return;
      }
      revision++;
      await route.fulfill({
        status: 200,
        headers,
        body: JSON.stringify(revision),
      });
      return;
    }
    if (url.includes("/study_backups")) {
      reads++;
      await route.fulfill({
        status: 200,
        headers,
        body: JSON.stringify({
          revision,
          payload: {
            settings: { ...defaults, palette: "forest" },
            tasks: [],
            sessions: [],
          },
        }),
      });
      return;
    }
    await route.fulfill({ status: 200, headers, body: "{}" });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Mở cài đặt", exact: true }).click();
  await page.getByText("Đồng bộ tài khoản (tùy chọn)", { exact: true }).click();
  await expect(page.getByText(user.email, { exact: true })).toBeVisible();
  expect(uploads).toBe(0);
  await page
    .getByRole("button", { name: "Kiểm tra bản đám mây", exact: true })
    .click();
  await expect.poll(() => reads).toBe(1);
  await page
    .getByRole("button", { name: "Lưu bản trên máy lên đám mây", exact: true })
    .click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Đã lưu dữ liệu lên tài khoản" }),
  ).toBeVisible();
  expect(uploads).toBe(1);
  conflict = true;
  await page
    .getByRole("button", { name: "Lưu bản trên máy lên đám mây", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Không thể đồng bộ" }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute(
    "data-palette",
    "lavender",
  );
  await page
    .getByRole("button", { name: "Tải bản đám mây về", exact: true })
    .click();
  await expect(
    page.getByRole("group", { name: "Xác nhận khôi phục" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Xác nhận khôi phục", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-palette", "forest");
});
