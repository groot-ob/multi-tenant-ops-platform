import { test, expect, Page } from '@playwright/test';

async function loginAndNavigateToDashboard(page: Page, tenantSlug: string) {
  // await page.goto('/login');
  // await page.fill('input[name="email"]', 'test@example.com');
  // await page.fill('input[name="password"]', 'password');
  // await page.click('button[type="submit"]');
  
  // Navigate directly to the tenant's incident list page.
  // Ensure your test environment has seeded data with incidents.
  await page.goto(`/t/${tenantSlug}/incidents`); 
  await expect(page).toHaveURL(new RegExp(`/t/${tenantSlug}/incidents`));
  await expect(page.locator('h1', { hasText: 'Incidents' })).toBeVisible();
}

test.describe('Notification Flow for Bulk Incident Update', () => {
  const TENANT_SLUG = 'acme-inc'; // Replace with a tenant slug you use in your test environment
  const INCIDENT_COUNT = 3;      // Number of incidents to select for bulk action

  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard before each test
    await loginAndNavigateToDashboard(page, TENANT_SLUG);
  });

  test('should update notification badge after bulk mitigating incidents', async ({ page }) => {
    // Initial check for notification badge (should be 0 or not visible)
    const initialBadge = page.locator('.notification-badge'); // Assuming a class or data-testid for your badge
    await expect(initialBadge).not.toBeVisible(); // Or expect(initialBadge).toHaveText('0');

    for (let i = 0; i < INCIDENT_COUNT; i++) {
      await page.locator(`tbody tr:nth-child(${i + 1}) input[type="checkbox"]`).click();
    }

    // Assert that the bulk action toolbar appears
    const bulkActionToolbar = page.locator('.bulk-action-toolbar'); // Assuming a class for your toolbar
    await expect(bulkActionToolbar).toBeVisible();
    await expect(bulkActionToolbar.locator('text=/selected/')).toContainText(`${INCIDENT_COUNT} selected`);

    // Click the "Bulk Mitigate" button
    await bulkActionToolbar.locator('button', { hasText: 'Mitigate' }).click();

    //  Assert the notification badge updates
    // It might take a moment for the server action and revalidation to complete
    await expect(initialBadge).toBeVisible();
    // Use a regex to allow for "3" or "3+" if your badge logic does that
    await expect(initialBadge).toHaveText(String(INCIDENT_COUNT)); 
    // If your badge just shows "New" or has a distinct color when active, adjust this assertion.
    await expect(initialBadge).toHaveClass(/bg-red-500/); // Ensure the visual styling is correct
  });

});