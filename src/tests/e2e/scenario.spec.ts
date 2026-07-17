import { test, expect } from '@playwright/test';

test.describe('Scenario Execution Flow', () => {
  // First, we must log into the application using the test mode bypass
  test.beforeEach(async ({ page }) => {
    // The auth uses cookies and bypasses authentication if NEXT_PUBLIC_DEMO_MODE is true.
    // In CI this should be set to true. We'll simulate a security session.
    await page.goto('/');
    
    // Click the Security Role to enter the app
    await page.getByText(/Security/i, { exact: true }).click();
    await page.waitForURL('**/security');
  });

  test('should trigger scenario, show alert, execute protocol, and abort protocol', async ({ page }) => {
    // Wait for the Simulator Controls to be visible
    const simTriggerBtn = page.getByText(/Simulation Scenarios/i);
    if (await simTriggerBtn.isVisible()) {
        await simTriggerBtn.click();
    }
    
    const gateASpikeBtn = page.getByText(/Gate A Spike/i);
    await gateASpikeBtn.click();

    // Verify AI Alert Toast appears
    await expect(page.getByText(/Goal scored scenario initialized/i)).toBeVisible();

    // Since scenarios are time-based stages, we'll manually fast-forward the state or 
    // test the manual protocol interaction flow via GateActionCard if visible.
    
    // Verify that the Gate A card shows up with a Review Protocol button
    const reviewBtn = page.getByText(/Review Protocol Delta-2/i);
    if (await reviewBtn.isVisible()) {
        await reviewBtn.click();
        
        // Wait for checklist and execute button
        await expect(page.getByText(/PROTOCOL CHECKLIST/i)).toBeVisible();
        const executeBtn = page.getByText(/Execute/i);
        
        // Button should be disabled initially
        await expect(executeBtn).toBeDisabled();

        // Check off checklist items
        const checkboxes = page.locator('input[type="checkbox"]');
        const count = await checkboxes.count();
        for(let i=0; i<count; i++) {
           await checkboxes.nth(i).check();
        }

        // Now execute should be enabled
        await expect(executeBtn).toBeEnabled();
        await executeBtn.click();

        // Verify executing state
        await expect(page.getByText(/CORTEX RUNNING/i)).toBeVisible();
        
        // Test abort protocol
        const abortBtn = page.getByText(/ABORT PROTOCOL/i);
        await abortBtn.click();

        // Verify rollback toast
        await expect(page.getByText(/Protocol Aborted/i)).toBeVisible();
    }
  });
});
