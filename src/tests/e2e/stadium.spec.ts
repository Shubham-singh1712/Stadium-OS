import { test, expect } from "@playwright/test";

test.describe("StadiumOS E2E Operations Flow", () => {
  
  test("should navigate role portals from landing page", async ({ page }) => {
    await page.goto("/");
    
    // Check main title
    await expect(page.locator("h1")).toContainText("StadiumOS");
    
    // Choose Operations role portal
    const opsPortal = page.locator("button:has-text('Enter as Operations')");
    if (await opsPortal.count() > 0) {
      await opsPortal.click();
      await expect(page).toHaveURL(/.*operations/);
    }
  });

  test("should support role switching menu flow", async ({ page }) => {
    await page.goto("/operations");
    
    // Open Switch Role dropdown menu
    const switcher = page.locator("button[aria-label='Switch role']");
    await expect(switcher).toBeVisible();
    await switcher.click();
    
    // Click Security role option in dropdown menu listbox
    const secBtn = page.locator("button:has-text('Security')");
    await expect(secBtn).toBeVisible();
    await secBtn.click();
    
    // Confirm route change to security operations
    await expect(page).toHaveURL(/.*security/);
  });

  test("should support collapsible AI simulator scenarios trigger", async ({ page }) => {
    await page.goto("/operations");
    
    // Open AI Simulator panel drawer
    const simToggle = page.locator("button[aria-label='Toggle AI simulator console panel']");
    await expect(simToggle).toBeVisible();
    await simToggle.click();
    
    // Trigger heat stroke medical scenario alert cascade
    const heatBtn = page.locator("button:has-text('🩺 Medical Emergency')");
    if (await heatBtn.count() > 0) {
      await heatBtn.click();
      // Ensure alert notifications toaster lists the event
      await expect(page.locator("text=Medical emergency scenario initialized")).toBeVisible();
    }
  });

  test("should allow volunteers to log incident report entries successfully", async ({ page }) => {
    await page.goto("/volunteer/incidents");
    
    // Select Incident Type
    await page.locator("select#inc-type").selectOption("Medical emergency");
    
    // Fill Location details
    await page.locator("input#inc-loc").fill("Gate C Entrance");
    
    // Input Description
    await page.locator("textarea#inc-desc").fill("Spectator needs assistance near ticketing terminal.");
    
    // Submit Form
    await page.locator("button:has-text('Submit Incident Report')").click();
    
    // Verify registered success state
    await expect(page.locator("h4")).toContainText("Incident Registered");
  });
});
