import { test, expect } from '@playwright/test';

// Basic example test to verify page title
// This helps track cross-browser behavior across runs.
test('homepage has expected title', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example Domain/);
});
