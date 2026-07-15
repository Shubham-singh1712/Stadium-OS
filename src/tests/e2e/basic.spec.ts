import { test, expect } from "@playwright/test";

test.describe("StadiumOS E2E Navigation Flow", () => {
  test("should load the landing page successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/StadiumOS AI/);
  });
});
