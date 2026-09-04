import { test, expect } from '@playwright/test';

test.describe('User Dashboard & Service Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/Email/i).fill('qa_user_test@test.com');
    await page.getByLabel(/Password/i).fill('password123');
    await page.getByRole('button', { name: /Sign In/i }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('Verify Service Selection and Joining Queue', async ({ page }) => {
    // 1. Verify Services load
    const serviceCards = page.locator('.grid > .rounded-xl.bg-white');
    await expect(serviceCards.first()).toBeVisible();
    
    // 2. Join a service
    const joinButton = serviceCards.first().getByRole('button', { name: /Join Queue/i });
    await joinButton.click();

    // 3. Verify Token appears
    const tokenValue = page.locator('text=Token Number').locator('..').locator('p.text-4xl');
    await expect(tokenValue).toBeVisible();
    const tokenNumber = await tokenValue.innerText();
    expect(tokenNumber).not.toBe('—');

    // 4. Verify Wait Time and People Ahead
    await expect(page.getByText(/People Ahead/i)).toBeVisible();
    await expect(page.getByText(/Estimated Wait/i)).toBeVisible();
  });

  test('Verify Token Persistence on Refresh', async ({ page }) => {
    // Join first
    const joinButton = page.locator('button:has-text("Join Queue")').first();
    if (await joinButton.isVisible()) {
        await joinButton.click();
    }

    await page.reload();
    await expect(page.getByText(/Token Number/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Cancel Token/i })).toBeVisible();
  });

  test('Verify Cancel Token functionality', async ({ page }) => {
    const cancelButton = page.getByRole('button', { name: /Cancel Token/i });
    if (await cancelButton.isVisible()) {
        await cancelButton.click();
        await expect(page.getByText(/Your queue token has been cancelled/i)).toBeVisible();
        await expect(cancelButton).not.toBeVisible();
        await expect(page.getByText(/No active queue token/i)).toBeVisible();
    }
  });
});
