import { test, expect } from '@playwright/test';

test('has initial ERD loaded and exports PNG successfully', async ({ page }) => {
  // 1. Go to the app
  await page.goto('/');

  // 2. Wait for the canvas to render
  const canvas = page.locator('#canvas-container');
  await expect(canvas).toBeVisible();

  // 3. Open Export Dialog
  await page.getByRole('button', { name: /Export Diagram/i }).click();

  // 4. Verify modal opened
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(page.getByText('Export Options')).toBeVisible();

  // 5. Trigger PNG Export
  await page.getByRole('button', { name: /Export PNG/i }).click();

  // 6. Wait for the Export Overlay (Processing)
  const overlay = page.getByText(/Rendering PNG.../i);
  await expect(overlay).toBeVisible();

  // 7. Wait for Preview Modal to appear
  const previewModal = page.getByText('Export Preview');
  await expect(previewModal).toBeVisible({ timeout: 15000 });

  // 8. Verify the image is present inside the preview modal
  const previewImg = page.locator('img[alt="Preview"]');
  await expect(previewImg).toBeVisible();

  // 9. Close the preview modal
  await page.getByRole('button', { name: /Cancel/i }).click();
  await expect(previewModal).toBeHidden();
});
